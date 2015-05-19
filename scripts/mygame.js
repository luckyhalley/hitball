/*
 charset "utf-8";
 Author : halley
 My Site: http://www.51tasty.com/
 Careate Date : 2012-7
 Version: 1.0
 */

var halleysGame = window.halleysGame || {};
//Constant
halleysGame.CANVASID = 'halleysCanvas';
halleysGame.CANVAS_WIDTH = 1020;
halleysGame.CANVAS_HEIGHT = 646;
halleysGame.INITIMAGES = ['images/bg.jpg', 'images/c1.png', 'images/c2.png', 'images/c3.png', 'images/c4.png', 'images/c5.png', 'images/c6.png', 'images/c7.png', 'images/c8.png', 'images/c9.png'];
halleysGame.FRACTION = ['images/add1.png', 'images/add2.png', 'images/add3.png', 'images/add4.png', 'images/add5.png', 'images/add6.png', 'images/add7.png', 'images/add8.png', 'images/add9.png'];
halleysGame.AUDIO = true;
halleysGame.FRAMERATE = 20;
halleysGame.GAMETIMES = 1000 * 60;
halleysGame.DOMS = null;
//safari 
if ($.browser.safari) {
	halleysGame.AUDIO = false;
}
//load material
halleysGame.loadMaterial = function(){};
halleysGame.loadMaterial.prototype = {
	mask: true,
	imgs: [],
	init: function(callback){
		if(halleysGame.DOMS){
			callback(halleysGame.DOMS);
			return false;
		}
		if(this.mask){
			var mask = '<div id="mask" style="position:absolute; left:0; top:0; width:100%; height:100%; background:#000; opacity:0.5;">' +
							'<div style="position:absolute; left:42%; top:48%; width:16%; height:1%; background:#000; padding:1px; border:1px solid #d6d8eb;">' +
								'<span style="width:0; height:100%; display:block; background:#d6d8eb;" id="progress"></span>' +
							'</div>' +
							'<span style="position:absolute; left:40%; top:51%; width:20%; text-align:center; color:#d6d8eb;font-family: times New Roman;" id="progress_material"></span>' +
							'<span style="position:absolute; left:40%; top:55%; width:20%; text-align:center; color:#d6d8eb;font-family: times New Roman;" id="progress_text">0%</span>' +
						'</div>';
			$(mask).appendTo($('body'));
		}
		var img;
		var index = 0;
		var imgs = this.imgs.concat(halleysGame.FRACTION);
		var imgDoms = {
			scene: '',
			balloons: [],
			fraction: []
		};
		var _this = this;
		for(var i = 0; i < imgs.length; i++){
				img = new Image;
				img.src = imgs[i];
				if(i == 0){
					imgDoms.scene = img;
				}else if(i > 0 && i <this.imgs.length ){
					imgDoms.balloons.push(img);
				}else{
					imgDoms.fraction.push(img);
				}
				img.onload = function(){
					index++;
					$('#progress_material').text('素材加载中(' + imgs[index] +')');
					$('#progress').css('width', (100 / imgs.length * index) + '%');
					$('#progress_text').text( Math.floor(100 / imgs.length * index) + '%');
					if(index == imgs.length){
						if($('#mask')){
							$('#mask').fadeOut('2000');
						}
						halleysGame.DOMS = imgDoms;
						callback(imgDoms);
					}
				}
		}
	}
};

//canvas
halleysGame.canvas = function() {};
halleysGame.canvas.prototype = {
	_ctx: null,
	_width: halleysGame.CANVAS_WIDTH,
	_height: halleysGame.CANVAS_HEIGHT,
	getCtx: function() {
		return this._ctx;
	},
	setCtx: function(thectx){
		this._ctx = thectx;
	},
	init: function(canvas_id){
		var _canvas = document.getElementById(canvas_id);
		if ( ! _canvas || ! _canvas.getContext ) return false;
		this.setCtx(_canvas.getContext('2d'));
	},
	clear: function(){
		this._ctx.clearRect(0, 0, this._width, this._height );
	}
};

//scene
halleysGame.scene = function() {};
halleysGame.scene.prototype = {
	_ctx: null,
	_img: null,
	init: function(imgDoms, ctx) {
		if(!ctx){
			var canvas = new halleysGame.canvas();
			canvas.init(halleysGame.CANVASID);
			ctx = canvas._ctx;
		}
		this._ctx = ctx;
		this._img = imgDoms
	},
	drawScene: function() {
		this._ctx.save();
		this._ctx.drawImage(this._img, 0, 0);
		this._ctx.restore();
	}
};

//balloons
halleysGame.balloons = function() {};
halleysGame.balloons.prototype = {
	_ctx: null,
	_img: null,
	_lv: -1,
	_x: 0,
	_y: 570,
	_broke: false,
	_brokeDelay: 0,
	_fraction: null,
	init: function(imgDoms, fractionDoms, ctx){
		if(!ctx){
			var canvas = new halleysGame.canvas();
			canvas.init(halleysGame.CANVASID);
			ctx = canvas._ctx;
		}
		this._ctx = ctx;
		this._img = imgDoms;
		this._fraction = fractionDoms;
	},
	drawBalloon: function(){
		this._ctx.save();
		if(this._x == 0){
			this._x = Math.floor( Math.random() * 874) + 50;
		}
		if(this._lv == -1){
			this._lv = Math.floor( Math.random() * this._img.length);
		}
		if(this._broke){
			this._ctx.drawImage(this._fraction[this._lv], this._x, this._y);
			this._brokeDelay ++;
		}else{
			this._ctx.drawImage(this._img[this._lv], this._x, this._y);
		}
		this._ctx.restore();
	}
};

//game
halleysGame.game = {
	ready: function(){
		if($(window).height() > halleysGame.CANVAS_HEIGHT){
			document.getElementById('halleysCanvasWrapper').style.marginTop = ($(window).height() - halleysGame.CANVAS_HEIGHT) / 2 + 'px';
		}
		$('<a href="#"><img src="images/start.png" /></a>').bind('click', function(e){
			halleysGame.game.run();
			$(this).hide();
			e.preventDefault();
		}).css({position:'absolute', left: '370px', top: '270px'}).appendTo($('#halleysCanvasWrapper'));
	},
	run: function(){
		var self = this;
		//get canvas context
		var canvas = new halleysGame.canvas();
		canvas.init(halleysGame.CANVASID);
		var ctx = canvas._ctx;
		//create mask
		var mask = new halleysGame.loadMaterial();
		mask.imgs = halleysGame.INITIMAGES;
		mask.init(function(doms){
			self.fraction = doms.fraction;
			var scene = new halleysGame.scene();
			scene.init(doms.scene, ctx);
			
			var ballTimer = setInterval(function(){
				canvas.clear();
				scene.drawScene();
				self.idx++;
				//记时器
				self.timmer(ctx, self.idx);
				//增加1个气球
				if(self.idx % 25 == 0){
					self.balloon = new halleysGame.balloons();
					self.balloon.init(doms.balloons, doms.fraction, ctx);
					self.balloons.push(self.balloon);
				}
				for(var i = 0; i < self.balloons.length; i++){
					if(!self.balloons[i]._broke){
						self.balloons[i]._y = self.balloons[i]._y - Math.floor((self.balloons[i]._lv + 1));
					}else{
						self.balloons[i]._y = self.balloons[i]._y - 2;
					}
					if(self.balloons[i]._y < -80 || (self.balloons[i]._broke && (self.balloons[i]._brokeDelay + 1) % 35 == 0)) {
						self.balloons[i] = null;
						self.balloons.splice(i,1);
					}else{
						
					}
					if(self.balloons[i]){
						self.balloons[i].drawBalloon();
					}
				}
				
				if(halleysGame.FRAMERATE * self.idx >= halleysGame.GAMETIMES){
					self.game_over(ballTimer, ctx);	
				}
				
				self.showSummer(ctx);

			}, halleysGame.FRAMERATE);	
		});	
		
		this.start_monitor();
		this.audio();
		
	},
	game_over: function(t, ctx){
		window.clearInterval(t);
		if($('#game_over').length > 0 ){
			$('#game_over').show();
			$('#game_score').show();
		}else{
			$('<div id=\"game_over\"></div>').css({
				width: halleysGame.CANVAS_WIDTH,
				height: halleysGame.CANVAS_HEIGHT,
				position: 'absolute',
				zIndex: 1000,
				background:'#000',
				opacity: 0.5,
				top: 0,
				left: 0,
			}).appendTo($('#halleysCanvasWrapper'));
		
			$('<div id=\"game_score\"><span></span><a href="#"><img src="images/restart.png" /></a></div>').css({
				width: halleysGame.CANVAS_WIDTH,
				height: halleysGame.CANVAS_HEIGHT - 200,
				position: 'absolute',
				zIndex: 1001,
				top: 0,
				left: 0,
				fontSize: 25,
				paddingTop: 200,
				color: '#fff'
			}).appendTo($('#halleysCanvasWrapper'));
			
		}
		$('#game_score span').css({float: 'left', width: '100%', textAlign: 'center', height: '40px'}).text('GAME OVER!Your score is ' + this.summer);

		this.idx = 0;
		this.summer = 0;
		this.balloons = [];

		$('#game_score a').css({float: 'left', marginLeft: '400px'}).unbind('click').bind('click', function(){
			ctx.clearRect(0, 0, halleysGame.CANVAS_WIDTH, halleysGame.CANVAS_HEIGHT );
			$('#game_over').hide();
			$('#game_score').hide();
			halleysGame.game.run();
			return false;
		});

	},
	summer: 0,
	balloons: [],
	balloon: {},
	fraction: [],
	idx: 0,
	start_monitor: function(){
		var self = this;
		$('#'+halleysGame.CANVASID).bind('mousedown', function(e){
			var offset = $(this).offset();
			var x = e.pageX - offset.left;
			var y = e.pageY - offset.top;
			self.check_hit(x, y);
		});
	},
	check_hit: function(x, y){
		for(var i = 0; i < this.balloons.length; i++){
			var balloon = this.balloons[i];
			if((x > balloon._x + 28) && (x < balloon._x + 72) && (y > balloon._y + 6) && (y < balloon._y + 74)){
				//this.balloon = null;
				//this.balloons.splice(i,1);
				if(halleysGame.AUDIO){
					document.getElementById('halleysBom').play();
				}
				this.balloons[i]._broke = true;
				this.summer += balloon._lv + 1;
			}	
		}
	},
	audio: function(){
		if(halleysGame.AUDIO){
			var audioHTML = '<audio id="halleysBom" style="display:none;">' +
							  '<source src="audio/bom.wav" type="audio/wav" />' +
							'</audio>';
			audioHTML += '<audio id="halleysBg" style="display:none;" autoplay="autoplay" loop="loop">' +
							  '<source src="audio/1029.mp3" type="audio/mp3" />' +
							  '<source src="audio/1029.wav" type="audio/wav" />' +
							'</audio>';
			$(audioHTML).appendTo($('body'));
		}
	
	},
	timmer: function(ctx, index){
		var minus = index * halleysGame.FRAMERATE;
		ctx.font = '25px 微软雅黑';
		ctx.fillStyle = '#de5f0a';
		ctx.fillText('剩余时间:', 875, 550);
		ctx.font = '50px arial';
		ctx.fillText(Math.floor((halleysGame.GAMETIMES - minus) /1000), 900, 610);
	},
	showSummer: function(ctx){
		ctx.font = '45px 微软雅黑';
		ctx.fillStyle = '#3769f7';
		ctx.fillText('总分:'+ this.summer, 435, 50);
		ctx.font = 'bold 15px arial';
		ctx.fillStyle = '#000000';
		ctx.fillText('Halley\'s HTML5打气球 V1.0', 15, 630);

	}
};


//dom ready
$(function(){
	halleysGame.game.ready();
});