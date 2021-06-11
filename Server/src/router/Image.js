var express = require('express');
var router = express.Router();
const AWS = require('aws-sdk')
const crypto = require('crypto')
const request = require('request-promise')
const {create} = require('ipfs-http-client');
const { performance } = require('perf_hooks')

const {save_results} = require('../controller/ImageController.js')
const secrets= require('../../secrets.js')
const knex = require('knex')(secrets.database)
AWS.config.update(secrets.aws)
const s3 = new AWS.S3()

const randomString = (n) => crypto.randomBytes(n).toString('hex')
const IPFS_HOST     = 'ipfs.infura.io'
const IPFS_PORT     = 5001
const IPFS_PROTOCOL = 'https'

router.get('/i', async (req, res) => {
    const key = req.query.k
    if (!key) return res.sendStatus(404)
    const { id, vector, label, parent1 } = await knex.from('image').where({ key }).first()
    let pkey = null
    if (parent1 != null) {
        let res = await knex.select('key').from('image').where({ id: parent1 }).first()
        pkey = res.key
    }
    res.send({ key, pkey, vector, label, label_names })
})

router.get('/info', async (req, res) => {
    const key = req.query.k
    if (!key) return res.sendStatus(404)
    const { vector, label } = await knex.from('image').where({ key }).first()
    res.send({ vector, label })
})

router.post('/image_children', async (req, res) => {
    const key = req.body.key
    if (!key) return res.sendStatus(404)
    try {
        const q = knex.from('image').where({ key }).first()
        const { id, state, vector, label, size } = await q

        if (state == 0) {
            const t = performance.now()
            const url = (size == 128) ? secrets.ganurl128 : secrets.ganurl256
            const [ imgs, vectors, labels ] = await request({
                url: url+'/children',
                method: 'POST',
                json: true,
                form: {
                    label: JSON.stringify(label),
                    vector: JSON.stringify(vector)
                }
            })
            console.log(`Made children in: ${performance.now() - t}`)
            await knex('image').where({ id }).update({ state: 1 })
            const children = await save_results({ imgs, vectors, labels, size, parent1: id })
            return res.send(children)
        } else if (state == 1) {
            const children = await knex.from('image').select('key').where({ parent1: id, parent2:null })
            if (children.length) {
                return res.send(children)
            }
            // Children are being processed, do not request more.
            return res.send([])
        }
    } catch(err) {
        console.log('Error: /image_children', err)
        return res.sendStatus(500)
    }
})

router.post('/mix_images', async (req, res) => {
    const key1 = req.body.key1
    const key2 = req.body.key2
    if (!key1 || !key2) return res.sendStatus(400)
    try {
        const image1 = await knex.from('image').where({ key:key1 }).first()
        const image2 = await knex.from('image').where({ key:key2 }).first()

        if (image1.size != image2.size) {
            return res.status(400).send('Cannot mix images of differnet sizes.')
        }
        const url = (image1.size == 128) ? secrets.ganurl128 : secrets.ganurl256
        const [ imgs, vectors, labels ] = await request({
            url: url+'/mix_images',
            method: 'POST',
            json: true,
            form: {
                label1: JSON.stringify(image1.label),
                label2: JSON.stringify(image2.label),
                vector1: JSON.stringify(image1.vector),
                vector2: JSON.stringify(image2.vector)
            }
        })
        const children = await save_results({ imgs, vectors, labels,
                                              size: image1.size,
                                              parent1: image1.id,
                                              parent2: image2.id })
        return res.send(children)
    } catch(err) {
        console.log('Error: /mix', err)
        return res.sendStatus(500)
    }
})

router.post('/mix_category_images', async (req, res) => {
    const key1 = req.body.key1
    const key2 = req.body.key2
    if (!key1 || !key2) return res.sendStatus(400)
    try {
        const url = secrets.ganurl256
        const [ imgs, vectors, labels ] = await request({
            url: url+'/mix_category_images',
            method: 'POST',
            json: true,
            form: {
                categoryA: JSON.stringify(key1),
                categoryB: JSON.stringify(key2),
            }
        })
        const children = await save_results({ imgs, vectors, labels,
                                              size: 512 })
        return res.send(children)
    } catch(err) {
        console.log('Error: /mix', err)
        return res.sendStatus(500)
    }
})

router.post('/random', async (req, res) => {
    try {
        const size = 1028
        const [ imgs, vectors, labels ] = await request({
            url: secrets.ganurl256+'/random',
            method: 'POST',
            json: true,
            form: { num: '1' }
        })
        const children = await save_results({ imgs, vectors, labels, size })
        return res.send(children)
    } catch(err) {
        console.log('Error: /random', err)
        return res.sendStatus(500)
    }
})

router.post('/upload', async function(req, res) {
    const ipfsAPI = create({ host: IPFS_HOST, port: IPFS_PORT, protocol: IPFS_PROTOCOL });

    
    /** FileObject */
    const files = [{
        content:   req.files.file.data
    }];

    try {
        const result = await ipfsAPI.add(files);
        return res.send(`https://ipfs.infura.io/ipfs/${result.path}`);
    } catch(err) {
        return res.send(`${err}`);
    }


})

module.exports = router;