import {select, mouse} from 'd3-selection';
import {default as Mounter} from './mounter';
import {default as lib} from './lib';

/*eslint-disable */
if (ENV !== 'production') {
	document.write(
	 '<script src="http://' + (location.host || 'localhost').split(':')[0] +
	 ':35729/livereload.js?snipver=1"></' + 'script>'
	);
}
/*eslint-enable */


function tooltip () {
	var tooltipElem,
		_attachPoint,
		_trackFn = null,
		_offset = { x: 5, y: 5},
		_constrain = null,
		_evts = [],
		_namespace = null,
		_isInited = false;

	function update (evtTarget, context) {
		var mounter = evtTarget.node().__mounter;
		mounter.mount(context);
	}

	function mouseHoverHandler (evtSeq, evts, target) {
		return function () {
			var arg = [].slice.call(arguments, 0),
				pos = mouse(this);

			arg.push(pos);
			arg.push(this.__mounter);

			update(select(this), { pos: pos });
			evts[evtSeq].apply(target, arg);
			
		};	
	}

	function attachTooltip (elem, evts) {
		elem.on('mouseover.d3-tooltip', mouseHoverHandler(0, evts, tooltipElem));
		elem.on('mousemove.d3-tooltip', mouseHoverHandler(1, evts, tooltipElem));
		elem.on('mouseout.d3-tooltip', mouseHoverHandler(2, evts, tooltipElem));

		return elem;
	}

	function inst (selection) {
		if (!_isInited) {
			tooltipElem = _attachPoint.append('g');
			
			_evts = [inst._onMouseOver, inst._onMouseMove, inst._onMouseOut];
			selection.each(function (d) {
				attachTooltip(select(this), _evts);
				this.__mounter = 
					(new Mounter({namespace: _namespace}))
						.addData(d)
						.mountTo(tooltipElem);
			});
		} else {
			selection.each(function (d) {
				this.__mounter 
						.addData(d)
						.mountTo(tooltipElem);
			});
		}

		_isInited = true;
	}

	inst.attachTo = function (attachPoint) {
		_attachPoint= attachPoint;

		return inst;
	};

	inst.offset = function (offset) {
		lib.mergeRecursive(_offset = {}, offset);

		return inst;
	};

	inst.constrain = function (width, height) {
		_constrain = {
			width: width,
			height: height
		};
		
		return inst;
	};

	inst.track = function (fn) {
		_trackFn = fn && typeof fn === 'function' && fn;
		
		return inst;
	};

	inst.namespace = function (namespace) {
		_namespace = namespace;
		return inst;
	};

	_trackFn = inst._getDefaultTrack = function (data, index, elem, pos) {
		return pos;
	};

	inst._onMouseOver = function() {
		return this.style('display', 'block');
	};

	inst._onMouseMove = function() {
		var size,
			offsetY,
			heightAdjustmentNeeded = false,
			pos = _trackFn.apply(tooltipElem, [].slice.call(arguments, 0)),
			mounter = arguments[4];

		size = mounter.size();
		
		if (_constrain) {
			if (_constrain.width) {
				if (pos[0] + _offset.x + size.width > _constrain.width) {
					if (pos[0] - _offset.x - size.width < 0) {
						pos[0] = 0;
						heightAdjustmentNeeded = true;
					} else {
						pos[0] -= _offset.x + size.width;
					}
				} else {
					pos[0] += _offset.x;
				}
			}

			if (_constrain.height || heightAdjustmentNeeded) {
				_constrain.height = _constrain.height || Number.POSITIVE_INFINITY;
				if (heightAdjustmentNeeded) { 
					offsetY = _offset.y * 3;
				} else {
					offsetY = _offset.y;
				}

				if (pos[1] + offsetY + size.height > _constrain.height) {
					pos[1] -= offsetY + size.height;
				} else {
					pos[1] += offsetY;
				}
			} 
		} else {
			pos[0] += _offset.x;
			pos[1] += _offset.y;
		}

		return this
			.attr('transform', 'translate(' + pos[0] + ', ' + pos[1] + ')');
	};

	inst._onMouseOut = function() {
		return this.style('display', 'none');
	};


	return inst;
}

export default tooltip;
