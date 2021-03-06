/* @todo dont create dom elements when title or body is null  */

import {default as SmartLabelManager} from 'fusioncharts-smartlabel';
import {select} from 'd3-selection';
import {default as lib} from './lib';

var __proto;

function populateModel (template, source, sink) {
	var i,
		l,
		unitBody,
		bodyElm,
		sourceUB,
		sourceUBElm,
		count = 0,
		title = sink.shift(),
		body = sink;

	function injectPropsInModel (srcProp, templProp, target) {
		templProp && lib.mergeRecursive(srcProp, templProp);
		if (typeof target === 'object' && target !== null) {
			lib.mergeRecursive(srcProp, target);
		} else {
			srcProp.text.push(target);
		}		
	}

	source = source || {};
	template = template || {};

	injectPropsInModel((source.title = source.title || {}), template.title, title);
	
	source.body = source.body || [];
	while((unitBody = body.shift())) {
		sourceUB = source.body[count];
		sourceUB || source.body.push((sourceUB = []));
		
		if (unitBody instanceof Array) {
			for (i = 0, l = unitBody.length; i < l; i++) {
				sourceUBElm = sourceUB[i];
				sourceUBElm || sourceUB.push((sourceUBElm = {}));
				bodyElm = unitBody[i];
				
				injectPropsInModel(sourceUBElm, template.body, bodyElm);
			}
		} else {
			sourceUBElm = sourceUB[0];
			sourceUB.push((sourceUBElm = {}));
			injectPropsInModel(sourceUBElm, template.body, unitBody);
			sourceUB.splice(1);
		}

		count++;
	}
}

function Mounter (config) {
	var bodyClsName;

	this.config = config || {};


	this.smartlabel = new SmartLabelManager(Math.random());
	
	this.verticalLimit = undefined;
	this.horizontalLimit = undefined;
	this.data = null;
	this.model = null;
	this.mountPoint = null;
	this._firables = null;
	this._context = null;
	this.clsNS = this.config.namespace;
	
	this.baseClassName = this.clsNS ? this.clsNS + '-d3-tooltip' :
		'd3-tooltip';
	bodyClsName = this.baseClassName + '-body';

	this.title = {
		model: null,
		args: {
			className: this.baseClassName + '-title',
			padding: [2, 5, 5],
			margin: [2, 5]
		},
		_graphics: {}
	};

	this.body = {
		model: null,
		args: {
			className: bodyClsName,
			padding: [2, 5, 5],
			margin: [2, 5],
			icon: {
				className: bodyClsName + '-icon',
				_size: null
			},
			text: {
				className: bodyClsName + '-text'
			}
		},
		_graphics: {}
	};
}

Mounter.SEPARATOR = {
	N: '\n',
	S: '\s',
	T: '\t',
	_def: function (smartlabel, lines, token) {
		var i1,
			l1,
			fn,
			width = 0,
			height = 0,
			dummy = smartlabel.getOriSize('W'),
			space = dummy.width,
			lineHeight = dummy.height,
			lineSize = [];



		function calculateSize (arr, spaceSize) {
			var i2,
				l2,
				size = 0;

			for (i2 = 0, l2 = arr.length; i2 < l2; i2++) {
				size += lineSize[i2] + space * spaceSize;
			}

			return size - (space * spaceSize);
		}

		for (i1 = 0, l1 = lines.length; i1 < l1; i1++) {
			lineSize.push(smartlabel.getOriSize(lines[i1]).width);
		}

		switch (token) {
			case Mounter.SEPARATOR.N:
				fn = function (i) {
					return {
						x: 0,
						y: lineHeight * i
					};
				};
				break;

			case Mounter.SEPARATOR.T:
				fn = function (i) {
					return {
						x: i ? space * 2 : 0,
						y: 0
					};
				};
				width = calculateSize(lineSize, 2);
				height = !width ? width: lineHeight;
				break;

			case Mounter.SEPARATOR.S:
			default:
				fn = function (i) {
					return {
						x: i ? space * 0.5 : 0,
						y: 0
					};
				};
				width = calculateSize(lineSize, 0.5);
				height = !width ? width : lineHeight;
		}

		return {
			fn: fn,
			oriWidth: width,
			oriHeight: height
		};
	}
};

(__proto = Mounter.prototype).constructor = Mounter;

__proto._prepareTooltipModel = function (initData) {
	var model = {},
		template = {
			title: {
				icon: null,
				text: [],
				breakBy: Mounter.SEPARATOR.S
			},
			body:{
				icon: null,
				text: [],
				rank: 1,
				breakBy: Mounter.SEPARATOR.S
			}
		};

	populateModel(template, model, initData);
	return model;
};

__proto._prepareFirables = function (model) {
	var i1,
		l1,
		i2,
		l2,
		unitBody,
		bodyElm,
		titleExec,
		bodyElmExec,
		bodyExec = [],
		title = model.title,
		body = model.body;

	function get (arr) {
		var i,
			l,
			el,
			obj,
			prop,
			exec = [];

		if (arr instanceof Array) {
			for (i = 0, l = arr.length; i < l; i++) {
				el = arr[i];
				if (el && typeof el === 'function') {
					exec.push([i, el]);
				}
			}
		} else {
			obj = arr;
			prop = arguments[1];
			el = obj[prop];

			if (el && typeof el === 'function') {
				exec.push([prop, el]);		
			}
		}

		if (exec.length === 0) {
			return  null;
		}

		return exec.map(function (_arr) {
			return (_arr.unshift(obj || arr), _arr);
		});
	}

	titleExec = get(title.text);

	for (i1 = 0, l1 = body.length; i1 < l1; i1++) {
		unitBody = body[i1];
		for (i2 = 0, l2 = unitBody.length; i2 < l2; i2++) {
			bodyElm = unitBody[i2];
			
			bodyElmExec = get(bodyElm.text);
			bodyElmExec && [].push.apply(bodyExec, bodyElmExec);
			bodyElmExec = get(bodyElm, 'rank');
			bodyElmExec && [].push.apply(bodyExec, bodyElmExec);
		}
	}

	return (titleExec || []).concat(bodyExec);
};

__proto._executeFirables = function (model, args) {
	var i,
		l,
		exec,
		fn,
		fireables = this._firables;

	for (i = 0, l = fireables.length; i < l; i++) {
		exec = fireables[i];
		if (!((fn = exec[2]) && typeof fn === 'function')) { continue; }
		exec[0][exec[1]] = exec[2](args);
	}

	return this;
};

__proto.setLimit = function (limit) {
	this.limit = limit;
	return this;
};

__proto.addData = function (data) {
	var model;

	this.data = data;
	model = this.model = this._prepareTooltipModel(data);
	this._firables = this._prepareFirables(model);

	this
		.addTitle(model.title)
		.addBody(model.body);

	return this;
};

__proto.addTitle = function (model) {
	this.title.model = model;
	lib.mergeRecursive(this.title.args, model.args);	
		
	return this;
};

__proto.addBody = function (model) {
	this.body.model = model;	
	lib.mergeRecursive(this.body.args, model.args);

	return this;
};

__proto.mountTo = function (elem) {
	this.mountPoint = elem;

	return this;
};

__proto.mount = function (context) {
	var titleG,
		bodyG,
		container,
		logicalBox,
		mountPoint = this.mountPoint,
		title = this.title,
		body = this.body,
		titleCls = title.args.className,
		bodyCls = body.args.className;

	this.context = context || null;

	this._executeFirables(this.model, context);

	container = mountPoint
		.attr('class', this.baseClassName)
		.selectAll('rect')
		.data([1]);

	container = 
		container
			.enter()
			.append('rect')
			.merge(container)
			.attr('class', this.baseClassName + '-container');

	titleG = mountPoint
		.selectAll('g.' + titleCls)
		.data([title.model]);

	titleG.exit().remove();
	titleG = title._graphics.g = 
		titleG
			.enter()
			.append('g')
				.attr('class', titleCls)
			.merge(titleG);
	bodyG = 
		mountPoint
			.selectAll('g.' + bodyCls)
			.data(body.model);

	bodyG.exit().remove();
	bodyG = body._graphics.g =
		bodyG
			.enter()
			.append('g')
				.attr('class', bodyCls)
			.merge(bodyG);
	
	
	logicalBox = 
		this
			.mountTitle(titleG)
			.mountBody(bodyG)
			.mountComponents();
	
	container
		.attr('x', 0)
		.attr('y', 0)
		.attr('height', this.verticalLimit = logicalBox.height)
		.attr('width', this.horizontalLimit = logicalBox.width);

	return this;
};

__proto.size = function () {
	return {
		height: this.verticalLimit,
		width: this.horizontalLimit	
	};
};

__proto.mountTitle = function (mountPoint) {
	var graphics = this.title._graphics,
		container,
		icon,
		text;

	container =  
		mountPoint
			.selectAll('rect')
			.data([1]);
	graphics.container =
		container
			.enter()
			.append('rect')
			.merge(container)
				.attr('class', mountPoint.attr('class') + '-container');

	icon =  
		mountPoint
			.selectAll('path')
			.data(function (d) { return d; });
			
	icon.exit().remove();
	graphics.icon =
		icon
			.enter()
			.merge(icon)
			.append('path')
			.merge(icon)
				.attr('class', mountPoint.attr('class') + '-icon');

	
	text = 
		mountPoint
			.selectAll('text')
			.data(function (d) { return [d.text]; });

	text.exit().remove();
	graphics.text =
		text
			.enter()
			.append('text')
			.merge(text)
			.attr('class', mountPoint.attr('class') + '-text');
	
	return this;
};

__proto.mountBody = function (mountPoint) {
	var graphics = this.body._graphics,
		unitBody,
		container,
		icon,
		text;

	container =  
		mountPoint
			.selectAll('rect')
			.data(function (d) { 
				return [d]; 
			});
	graphics.container =
		container
			.enter()
			.append('rect')
			.merge(container);

	unitBody =
		mountPoint
			.selectAll('g')
			.data(function (d) { 
				return d; 
			});
	unitBody.exit().remove();
	unitBody = graphics.unitBodyG = 
		unitBody
			.enter()
			.append('g')
			.merge(unitBody);

	icon =  
		unitBody
			.selectAll('path')
			.data(function (d) { 
				return [d]; 
			});	

	icon.exit().remove();
	graphics.icon =
		icon
			.enter()
			.append('path')
			.merge(icon);

	
	text = 
		unitBody
			.selectAll('text')
			.data(function (d) { 
				return [d.text]; 
			});

	text.exit().remove();
	graphics.text =
		text
			.enter()
			.append('text')
			.merge(text);
	
	return this;
};

__proto.mountComponents = function () {
	var res,
		preY,
		x = 0,
		y = 0,
		titleWidth,
		titleCon,
		mountAtomicComponent = this._mountAtomicComponent.bind(this),
		width = Number.NEGATIVE_INFINITY,
		title = this.title,
		tArgs = title.args,
		tGraph = title._graphics, 
		body = this.body,
		bArgs = body.args,
		bGraph = body._graphics;

	x = tArgs.margin[1];
	y = tArgs.margin[0];
	res = mountAtomicComponent(tGraph.g, titleCon = tGraph.container, 
		{
			icon: tGraph.icon,
			text: tGraph.text
		},
		{
			y: y,
			x: x
		},
		{
			padding: tArgs.padding
		}
	);

	y += !res.height ? res.height : res.height + tArgs.margin[0];
	width = Math.max(titleWidth = width, res.width);

	bGraph.g.each(function () {
		var g = select(this),
			unitg = g.selectAll('g'),
			container = g.selectAll('rect');

		preY = y;
		unitg.each(function () {
			var thisg = select(this),
				icon = thisg.selectAll('path'),
				text = thisg.selectAll('text');

			x = bArgs.margin[1];
			y += bArgs.margin[0];
			res = mountAtomicComponent(thisg, null, 
				{
					icon: icon,
					text: text
				},
				{
					y: y,
					x: x
				},
				{
					padding: bArgs.padding
				}
			);
			y += res.height + bArgs.margin[0];
			width = Math.max(width, res.width + bArgs.margin[1]);
		});

		container
			.attr('x', x)
			.attr('y', preY)
			.attr('width', width)
			.attr('height', y - preY);

		y += bArgs.margin[0];
	});

	if (width > titleWidth) {
		titleCon.attr('width', width);
	}
	
	width += bArgs.margin[1] * 2;
	y += tArgs.margin[1] - bArgs.margin[0];

	return {
		height: y,
		width: width
	};
};

__proto._mountAtomicComponent = function (group, container, content, offset, options) {
	var width,
		height,
		dxdyCalc,
		tspan,
		iconShift = 0,
		smartlabel = this.smartlabel,
		interPadding = (options.padding[2] || 0),
		ex = options.padding[1],
		ey = options.padding[0];

	tspan = content.text
		.selectAll('tspan')
		.data(function (d) {
			dxdyCalc = Mounter.SEPARATOR._def(
				smartlabel.setStyle(lib.getSmartComputedStyle(group)), 
				d,
				group.datum().breakBy);

			return d;
		});

	content.icon
		.attr('d', function (d) {
			var iconfn,
				_path,
				argedText;

			if ((iconfn = d.icon) && typeof iconfn === 'function') {
				_path = iconfn(
					dxdyCalc.oriHeight * 0.5 + offset.x + ex,
					dxdyCalc.oriHeight * 0.5 + offset.y + ey, 
					dxdyCalc.oriHeight * 0.5, 
					this.context);

				if (_path) {
					iconShift = dxdyCalc.oriHeight;
				}

				argedText = lib.getArgedText(_path);
				lib.applyStyleObj(select(this), argedText[1].style);

				return argedText[0];
			}		
		});

	tspan.exit().remove();
	tspan
		.enter()
		.append('tspan')
		.merge(tspan)
			.text(function (d) {
				var argedText = lib.getArgedText(d),
					css = argedText[1].style;

				lib.applyStyleObj(select(this), css);
				return argedText[0];	
			})
			.attr('dx', function (d, i) { 
				return dxdyCalc.fn(i).x;
			});

	content.text
		.attr('x', iconShift + interPadding + offset.x + ex)
		.attr('y', offset.y + ey)
		.attr('dy', '0.92em');

	width = iconShift + interPadding + dxdyCalc.oriWidth + ex * 2;
	height = !dxdyCalc.oriHeight ? dxdyCalc.oriHeight : dxdyCalc.oriHeight + ey * 2;

	container && container
		.attr('x', offset.x)
		.attr('y', offset.y)
		.attr('height', height)
		.attr('width', width);

	return {height: height, width: width};
};


export default Mounter;
