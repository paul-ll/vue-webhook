let http = require('http')
let crypto = require('crypto')
// let {spawn} = require('child_process');
let SECRET= '441768';
// let sendMail = require('./sendMail');
function sign(body){
    return `sha1=`+crypto.createHmac('sha1',SECRET).update(body).digest('hex');
}
let server = http.createServer(function(req,res){
	console.log(req.method,req.url)
	if(req.method == 'POST' && req.url == '/webhook'){
		let buffers = []
		req.on('data',function(buffer){
			buffers.push(buffer)
		})
		req.on('end',function(buffer){
		   let body = buffer.concat(buffers);
		   let event= req.header['x-github-event'];
		   let sig   = req.headers['x-hub-signature'];
		      if(sig !== sign(body)){
		        return res.end('Not Allowed');
		      }
		})
		res.setHeader('Content-Type','application/json')
		res.end(JSON.stringify({ok:true}))
	}else {
		res.end('Not Found')
	}
})
server.listen(4000,()=>{
	console.log('webhook服务已经在4000端口')
})