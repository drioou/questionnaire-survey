/*
 * @Author: duanyong
 * @Date:   2015-12-16 17:05:54
 * @Last Modified by:   duanyong
 * @Last Modified time: 2015-12-16 17:54:21
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
    shzEl = document.querySelector('.component'),
    shzCtrl = shzEl.querySelector('button.button--start'),
    shzSVGEl = shzEl.querySelector('svg.morpher'),
    snap = Snap(shzSVGEl),
    totalNotes = 50,
    notes,
    notesSpeedFactor = 4.5,
    simulateTime = 6500,
    winsize = {
        width: window.innerWidth,
        height: window.innerHeight
    },
    shzCtrlSize = {
        width: shzCtrl.offsetWidth,
        height: shzCtrl.offsetHeight
    },
    isListening = false,
    playerEl = shzEl.querySelector('.player'),
    playerCloseCtrl = playerEl.querySelector('.button--close');
function init(){
  createNotes();
  initEvents();
}
function createNotes(){
  var noteEl = document.createElement('div'),notesElContent = '';
  notesEl.className = 'notes';
  for(var i = 0; i < totalNotes;++i){
    var j =(i+1)-6*Math.floor(i/6);
    notesElContent += "<div class="note icon icon--note' + j +' "><div> ';
  }
  noteEl.innerHTML = noteElContent;
  shzEl.inserttBefore(notesEl,shzEl.firstChild)
  notes = [].slice.call(notesEl.querySelectorAll('.note'));
}
function initEvents(){
  shzCtrl.addeventListener('click',listen);
  playerCloseCtrl.addeventListener('click',closePlayer);
}
