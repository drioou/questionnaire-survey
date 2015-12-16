/*
 * @Author: duanyong
 * @Date:   2015-12-16 17:05:54
 * @Last Modified by:   duanyong
 * @Last Modified time: 2015-12-16 17:30:41
 */
var support = {
        transitions: Modernizr.csstransitions
    },
    transEndEventNames = {
        'WebkitTransition': 'webkitTransitionEnd',
        'MozTransition': 'transitionend',
        'OTransition': 'oTransitionEnd',
        'msTransition': 'MSTransitionEnd',
        'transition': 'transitionend'
    },
    transEndEventNames = transEndEventNames[Modernizr.prefixed('transition')],
    onEndTransition = function(el, callback, propTest) {
        var onEndCallbackFn = function(ev) {
            if (support.transition) {
                if (ev.target != this || propTest && ev.propertyName !== propTest && ev.propertyName !== prefix.css + propTest) return;
                this.removeEventListener(transEndEventNames, onEndCallbackFn);
            }
            if (callback && typeof callback === 'function') {
                callback.call(this);
            }
        };
        if (support.transitions) {
            el.addeventListener(transEndEventNames, onEndCallbackFn);
        } else {
            onEndCallbackFn();
        }
    },
