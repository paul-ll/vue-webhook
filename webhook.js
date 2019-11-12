let http = require('http')
let crypto = require('crypto')
let {spawn} = require('child_process');
let SECRET= '441768';
let sendMail = require('./sendMail');
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
		   let body = Buffer.concat(buffers);
		   let event= req.headers['x-github-event'];
		   let sig   = req.headers['x-hub-signature'];
		      if(sig !== sign(body)){
		        return res.end('Not Allowed');
		      }
		
		res.setHeader('Content-Type','application/json')
		res.end(JSON.stringify({ok:true}))
		 if(event === 'push'){
        let payload = JSON.parse(body);
        let child = spawn('sh', [`./${payload.repository.name}.sh`]);
        let buffers = [];
        child.stdout.on('data', function (buffer) { buffers.push(buffer)});
        child.stdout.on('end', function () {
          let logs = Buffer.concat(buffers).toString();
          sendMail(`
            <p>部署日期: ${new Date()}</p>
            <p>部署人: ${payload.pusher.name}</p>
            <p>部署邮箱: ${payload.pusher.email}</p>
            <p>提交信息: ${payload.head_commit&&payload.head_commit['message']}</p>
            <p>布署日志: ${logs.replace("\r\n",'<br/>')}</p>
        `);
        });
      }
      })
	}else {
		res.end('Not Found')
	}
})
server.listen(4000,()=>{
	console.log('webhook服务已经在4000端口')
})