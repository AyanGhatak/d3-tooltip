var lib = {};

lib.mergeRecursive = function (sink, source) {
	(function rec (_snk, _src) {
		var prop,
			srcVal;

		for (prop in _src) {
			if (!_src.hasOwnProperty(prop)) { continue; }
			
			srcVal = _src[prop];
			if (srcVal instanceof Array) {
				_snk[prop] = srcVal.slice(0);
			} else if (typeof srcVal === 'object') {
				if (srcVal === null) { continue; }	
				rec(srcVal, _snk[prop] || (_snk[prop] = {}));
			} else {
				_snk[prop] = srcVal;
			}
		}
	})(sink, source);

	return sink;
};

lib.getSmartComputedStyle = function (group, css) {
	var testText = 'W',
		mandatoryStyle = {'fill-opacity': 0, 'stroke-opacity': 0},
		className = typeof css === 'string' ? css : undefined,
		svgText,
		computedStyle,
		styleForSmartLabel;

	svgText = group
		.append('text')
		.text(testText);

	if (className) {
		svgText.attr('class', className);
	} else if (typeof css === 'object') {
		delete css['fill-opacity'];
		delete css['stroke-opacity'];

		lib.mergeRecursive(mandatoryStyle, css);
	}

	svgText
		.style(mandatoryStyle);

	computedStyle = getComputedStyle(svgText.node());
	styleForSmartLabel = {
		fontSize: computedStyle.fontSize,
		iFontSize: parseInt(computedStyle.fontSize.match(/\d+/)[0], 10),
		fontFamily: computedStyle.fontFamily,
		fontWeight: computedStyle.fontWeight,
		fontStyle: computedStyle.fontStyle
	};

	svgText.remove();

	return styleForSmartLabel;
};

lib.getArgedText = function (target) {
	var res = [];

	if (target instanceof Array) {
		res[0] = target[0] || '';
		res[1] = target[1] || {};
	} else {
		res[0] = target;
		res[1] = {};
	}
	return res;
};

lib.applyStyleObj = function (el, style) {
	var prop;

	el.node().removeAttribute('style');

	if (!style) {
		return el;
	}

	for (prop in style) {
		el.style(prop, style[prop]);
	}
	return el;
};

export default lib;