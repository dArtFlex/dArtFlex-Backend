import sys
import json
from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
import time
import urllib.request
import  tensorflow.compat.v1  as tf
import tensorflow_hub as hub
from tensorflow.python.framework import ops
import numpy as np
from scipy.stats import truncnorm
import random
import base64
from io import BytesIO
import PIL.Image
# import IPython.display
# from google.colab import files
# import cv2


module_path = 'https://tfhub.dev/deepmind/biggan-512/2'
rand_seed = 123
truncation = 0.1


tf.disable_eager_execution()
ops.reset_default_graph()
print('Loading BigGAN module from:', module_path)
module = hub.Module(module_path)
inputs = {k: tf.placeholder(v.dtype, v.get_shape().as_list(), k)
          for k, v in module.get_input_info_dict().items()}
output = module(inputs)
print('export:', output)
input_z = inputs['z']
input_y = inputs['y']
input_trunc = inputs['truncation']
random_state = np.random.RandomState(rand_seed)
dim_z = input_z.shape.as_list()[1]
vocab_size = input_y.shape.as_list()[1]

initializer = tf.global_variables_initializer()

sess = tf.Session()
sess.run(initializer)

def truncated_z_sample(batch_size):
    values = truncnorm.rvs(-2, 2, size=(batch_size, dim_z), random_state=random_state)
    return truncation * values

def create_labels(num, max_classes):
    label = np.zeros((num, vocab_size))
    for i in range(len(label)):
        for _ in range(random.randint(1, max_classes)):
            j = random.randint(0, vocab_size-1)
            label[i, j] = 950
        label[i] /= label[i].sum()
    return label

def one_hot(index, vocab_size=vocab_size):
    index = np.asarray(index)
    if len(index.shape) == 0:
        index = np.asarray([index])
    assert len(index.shape) == 1
    num = index.shape[0]
    output = np.zeros((num, vocab_size), dtype=np.float32)
    output[np.arange(num), index] = 1
    return output

def one_hot_if_needed(label, vocab_size=vocab_size):
    label = np.asarray(label)
    if len(label.shape) <= 1:
        label = one_hot(label, vocab_size)
    assert len(label.shape) == 2
    return label

def sample(vectors, labels, batch_size=10):
    num = vectors.shape[0]
    ims = []
    for batch_start in range(0, num, batch_size):
        s = slice(batch_start, min(num, batch_start + batch_size))
        feed_dict = {input_z: vectors[s], input_y: labels[s], input_trunc: truncation}
        ims.append(sess.run(output, feed_dict=feed_dict))
    ims = np.concatenate(ims, axis=0)
    assert ims.shape[0] == num
    ims = np.clip(((ims + 1) / 2.0) * 256, 0, 255)
    ims = np.uint8(ims)
    return ims

def create_variations(num, vector, label):
    new_vectors = np.zeros((num, vector.shape[0]))
    new_labels  = np.zeros((num, label.shape[0]))

    vector_mutation_rate = vector.std() * 4

    for i in range(num):
        new_labels[i][:] = label
        dv = (np.random.rand(*vector.shape)-0.5) * vector_mutation_rate
        new_vectors[i] = vector + dv
        new_vectors[i] /= max(-new_vectors.min(), new_vectors.max())

        # Reduce class
        if random.random() < 0.2:
            opts = np.nonzero(new_labels[i])[0]
            if len(opts) == 1:
                continue
            new_labels[i][random.choice(opts)] *= 0.2 + random.random() * 0.6

        # Add class.
        if random.random() < 0.3:
            new_labels[i][random.randint(0, label.shape[0]-1)] += random.random() * 0.5

        # Remove if less than two percent.
        new_labels[new_labels < .02] = 0

        # Normalize.
        new_labels[i] /= new_labels[i].sum()

    return new_vectors, new_labels

def interpolate(num, vector1, vector2, label1, label2):
    x = np.linspace(0, 1, num+2)
    new_vectors = np.zeros((num, vector1.shape[0]))
    new_labels  = np.zeros((num, label1.shape[0]))

    for i, v in enumerate(x[1: -1]):
        new_labels[i]  = v*label1 + (1-v) * label2
        new_vectors[i] = v*vector1 + (1-v) * vector2

    return new_vectors, new_labels

def create_random_images(num_images, max_classes):
    vectors = truncated_z_sample(num_images)
    labels = create_labels(num_images, max_classes)
    ims = sample(vectors, labels)

    return ims, vectors, labels

def encode_img(arr):
    # Encode uint8 values array into base64 string for sending.
    image = PIL.Image.fromarray(arr)
    buffered = BytesIO()
    image.save(buffered, format="JPEG", quality=90)
    img_bytes = base64.b64encode(buffered.getvalue())
    img_str = 'data:image/jpeg;base64,'+img_bytes.decode('ascii')
    print(img_str)
    return img_str
    
def imgrid(imarray, cols=5, pad=1):
    if imarray.dtype != np.uint8:
        raise ValueError('imgrid input imarray must be uint8')
    pad = int(pad)
    assert pad >= 0
    cols = int(cols)
    assert cols >= 1
    N, H, W, C = imarray.shape
    rows = N // cols + int(N % cols != 0)
    batch_pad = rows * cols - N
    assert batch_pad >= 0
    post_pad = [batch_pad, pad, pad, 0]
    pad_arg = [[0, p] for p in post_pad]
    imarray = np.pad(imarray, pad_arg, 'constant', constant_values=255)
    H += pad
    W += pad
    grid = (imarray
            .reshape(rows, cols, H, W, C)
            .transpose(0, 2, 1, 3, 4)
            .reshape(rows*H, cols*W, C))
    if pad:
        grid = grid[:-pad, :-pad]
    return grid

def imshow(a, format='png', jpeg_fallback=True):
    a = np.asarray(a, dtype=np.uint8)
    data = BytesIO()
    PIL.Image.fromarray(a).save(data, format)
    im_data = data.getvalue()
    try:
        disp = IPython.display.display(IPython.display.Image(im_data))
    except IOError:
        if jpeg_fallback and format != 'jpeg':
            print(('Warning: image was too large to display in format "{}"; '
                    'trying jpeg instead.').format(format))
            return imshow(a, format='jpeg')
        else:
            raise
    return disp

def get_transition_yz(classes, num_interps, truncation):
    noise_seed_A, noise_seed_B = 10, 20   # fix this!
    return get_interpolated_yz(classes, num_interps, noise_seed_A, noise_seed_B, truncation=truncation)

def get_random_yz(num_classes, num_interps, truncation):
    random_classes = [ int(1000*random()) for i in range(num_classes) ]
    return get_transition_yz(random_classes, num_interps, truncation=truncation)

def get_combination_yz(categories, noise_seed, truncation):
    z = np.vstack([truncated_z_sample(1)] * (len(categories)+1))
    y = np.zeros((len(categories)+1, 1000))
    for i, c in enumerate(categories):
        y[i, c] = 1.0
        y[len(categories), c] = 1.0
    return y, z

def slerp(A, B, num_interps):  # see https://en.wikipedia.org/wiki/Slerp
    alphas = np.linspace(-1.5, 2.5, num_interps) # each unit step tends to be a 90 degree rotation in high-D space, so this is ~360 degrees
    omega = np.zeros((A.shape[0],1))
    for i in range(A.shape[0]):
        tmp = np.dot(A[i],B[i])/(np.linalg.norm(A[i])*np.linalg.norm(B[i]))
        omega[i] = np.arccos(np.clip(tmp,0.0,1.0))+1e-9
    return np.array([(np.sin((1-a)*omega)/np.sin(omega))*A + (np.sin(a*omega)/np.sin(omega))*B for a in alphas])

def slerp_and_shape(A, B, num_interps):
    interps = slerp(A, B, num_interps)
    return (interps.transpose(1, 0, *range(2, len(interps.shape)))
                    .reshape(num_interps, *interps.shape[2:]))


# Regenerate Image using uploaded image
# def url_to_image(url):
#     resp = urllib.request.urlopen(url)
#     img = np.asarray(bytearray(resp.read()), dtype="uint8")
#     img = cv2.imdecode(img, cv2.IMREAD_COLOR)[...,::-1]
#     return img

# def classify_image(classifier, img):
#     h, w = hub.get_expected_image_size(classifier)
#     x = tf.placeholder(tf.float32, shape=(None, h, w, 3))
#     y = tf.nn.softmax(classifier(x))
#     data = transform.resize(img, [h, w])
#     with tf.Session().as_default() as sess:
#         tf.global_variables_initializer().run()
#         y_pred = sess.run(y, feed_dict={x: [data]})
#     return y_pred


# classifier = hub.Module("https://tfhub.dev/google/imagenet/nasnet_large/classification/1")
app = Flask(__name__, static_url_path='') #, static_folder='public', )
CORS(app)

@app.route('/')
def index():
    return "Hello, World!"

@app.route('/random', methods=['POST'])
def get_random():
    try:
        num = int(request.form['num'])
        print('Random', num)
        t = time.time()
        imgs, vectors, labels = create_random_images(num, max_classes=3)
        
        print('Finished in', time.time()-t)
        response = jsonify([
            [ encode_img(arr) for arr in imgs ],
            vectors.tolist(),
            labels.tolist()
        ])
        return response
    except Exception as e:
        print(e)
        return '', 500

@app.route('/children', methods=['POST'])
def children():
    try:
        print('children')
        vector = json.loads(request.form['vector'])
        label  = json.loads(request.form['label'])
        vector = np.asarray(vector, dtype='float64')
        label  = np.asarray(label, dtype='float64')
        new_vectors, new_labels = create_variations(12, vector, label)

        new_ims = sample(new_vectors, new_labels)

        return jsonify([
            [ encode_img(arr) for arr in new_ims ],
            new_vectors.tolist(),
            new_labels.tolist()
        ])
    except Exception as e:
        print(e)
        return '', 500

@app.route('/mix_images', methods=['POST'])
def mix_images():
    try:
        label1 = np.asarray(json.loads(request.form['label1']), dtype='float64')
        label2 = np.asarray(json.loads(request.form['label2']), dtype='float64')
        vector1 = np.asarray(json.loads(request.form['vector1']), dtype='float64')
        vector2 = np.asarray(json.loads(request.form['vector2']), dtype='float64')
        new_vectors, new_labels = interpolate(12, vector1, vector2, label1, label2)
        new_ims = sample(new_vectors, new_labels)
        return jsonify([
            [ encode_img(arr) for arr in new_ims ],
            new_vectors.tolist(),
            new_labels.tolist()
        ])
    except Exception as e:
        print(e)
        return '', 500

@app.route('/mix_category_images', methods=['POST'])
def mix_category_images():
    try:
        truncation = 0.08 #@param {type:"slider", min:0.02, max:1, step:0.02}
        noise_seed = np.random.randint(1000) 

        categoryA = json.loads(request.form['categoryA'])
        categoryB  = json.loads(request.form['categoryB'])

        categories = [int(categoryA), int(categoryB)]
        y, z = get_combination_yz(categories, noise_seed, truncation)
        imgs = sample(z, y)
        return jsonify([
            [ encode_img(arr) for arr in imgs ],
            z.tolist(),
            y.tolist()
        ])
    except Exception as e:
        print(e)
        return '', 500

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5000
    print('port=', port)
    app.run(host='0.0.0.0', debug=True, port=port)
