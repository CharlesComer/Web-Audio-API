window.onerror = (e) => alert(e);

const log = (...things) =>
{
	for (let x in things)
	{
		alert(Logger.stringify(things[x]));
	}
};

const GET = (url,type) =>
{
	return new Promise((res) =>
	{
		const xhr = new XMLHttpRequest();
		
		xhr.open("GET",url || "",true);
		
		xhr.responseType = type || "";
		
		xhr.onload = () =>
		{
			res(xhr.response);
		};
		
		xhr.send();
	});
};

class Loop
{
	static ready = 0;
	static childs = {};
	static childsName = [];
	
	static stop()
	{
		for (let x in Loop.childs)
		{
			try
			{
				Loop.childs[x].node.stop();
			} catch {}
		}
	}
	
	constructor (name)
	{
		this.name = name;
		this.src = `Loops/${name.split(" ").join("%20")}.wav`;
		
		Loop.childs[name] = this;
		
		if (Loop.childsName.length < 1)
		{
			Loop.childsName = [name];
		} else {
			Loop.childsName.push(name);
		}
	}
	
	play(loop)
	{
		this.node = ctx.createBufferSource();
		this.node.buffer = this.buffer;
		this.node.loop = loop || false;
		
		this.node.connect(gains.main);
		
		this.node.start();
	}
	
	load()
	{
		return new Promise((r,c) =>
		{
			GET(this.src, "arraybuffer")
			.then((datas) =>
			{
				ctx
				.decodeAudioData(datas,
				(buffer) =>
				{
					this.buffer = buffer;
					
					r();
				}).catch((e) => c(e));
			}).catch((e) => c(e));
		});
	}
}


const Load = () =>
{
	for (let x in Loop.childs)
	{
		const loop = Loop.childs[x];
		
		loop.load()
		.then(() =>
		{
			Loop.ready++;
			
			if (Loop.ready == Loop.childsName.length)
			{
				Loop.childsName.sort();
				
				for (let x in Loop.childsName)
				{
					const name = Loop.childsName[x];
					document.body.innerHTML += `<button onclick="Loop.stop(); Loop.childs['${name}'].play(true);">${name}</button>`;
				}
			}
		}).catch((e) => alert(e));
	}
};

onload = () =>
{
	const AudioCtx = window.AudioContext || window.webkitAudioContext;
	window.ctx = new AudioCtx();
	
	window.gains = {
		main: ctx.createGain()
	};
	gains.main.connect(ctx.destination);
	
	gains.main.gain.value = 0.8;
	
	GET("Loops/list.json","json")
	.then((list) =>
	{
		for (let x in list)
		{
			new Loop(list[x]);
		}
		
		Load();
	}).catch((e) => alert(e));
};
