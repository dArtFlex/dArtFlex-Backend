Bob buy Alice token
 -- http://localhost:8888/api/bid/buy
{"orderId":"0","itemId":1,"userId":2,"sellerId":1,"marketId":1,"bidAmount":"100000000000000","txHash":"0xad36619aa7784fdafc6e2bcaecae8ca503ff3d13772b2f63beda5e622aea5b17"}


Alice approve Bob bid
 -- http://localhost:8888/api/bid/accept_bid
{"id":4,"sellerId":1,"txHash":"0x954d1a6a62275ee5f555477f20c23837c4bce8341e65eba4e5d1767834f774bc"}


#############
 -- http://localhost:8888/api/bid/buy
{
  orderId: '0',
  itemId: 1,
  userId: 1,
  sellerId: 2,
  marketId: 1,
  bidAmount: '10000000000000',
  txHash: '0xc1a0368d710181e6b85b6beb0535a86f9065746d98fbd1869cc6298b61d51e64'
}