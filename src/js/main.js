;
(function(window) {
  /**
   * based on from https://github.com/inuyaksa/jquery.nicescroll/blob/master/jquery.nicescroll.js
   */
  function hasParent(e, p) {
    if (!e) return false;
    var el = e.target || e.srcElement || e || false;
    while (el && el != p) {
      el = el.parentNode || false;
    }
    return (el !== false);
  };

  /**
   * extend obj function
   */
  function extend(a, b) {
    for (var key in b) {
      if (b.hasOwnProperty(key)) {
        a[key] = b[key];
      }
    }
    return a;
  }

  /**
   * SelectFx function
   */
  function SelectFx(el, options) {
    this.el = el;
    this.options = extend({}, this.options);
    extend(this.options, options);
    this._init();
  }

  /**
   * SelectFx options
   */
  SelectFx.prototype.options = {
    // if true all the links will open in a new tab.
    // if we want to be redirected when we click an option, we need to define a data-link attr on the option of the native select element
    newTab: true,
    // when opening the select element, the default placeholder (if any) is shown
    stickyPlaceholder: true,
    // callback when changing the value
    onChange: function(val) {
      return false;
    }
  }

  /**
   * init function
   * initialize and cache some vars
   */
  SelectFx.prototype._init = function() {
    // check if we are using a placeholder for the native select box
    // we assume the placeholder is disabled and selected by default
    var selectedOpt = this.el.querySelector('option[selected]');
    this.hasDefaultPlaceholder = selectedOpt && selectedOpt.disabled;

    // get selected option (either the first option with attr selected or just the first option)
    this.selectedOpt = selectedOpt || this.el.querySelector('option');

    // create structure
    this._createSelectEl();

    // all options
    this.selOpts = [].slice.call(this.selEl.querySelectorAll('li[data-option]'));

    // total options
    this.selOptsCount = this.selOpts.length;

    // current index
    this.current = this.selOpts.indexOf(this.selEl.querySelector('li.cs-selected')) || -1;

    // placeholder elem
    this.selPlaceholder = this.selEl.querySelector('span.cs-placeholder');

    // init events
    this._initEvents();
  }

  /**
   * creates the structure for the select element
   */
  SelectFx.prototype._createSelectEl = function() {
    var self = this,
      options = '',
      createOptionHTML = function(el) {
        var optclass = '',
          classes = '',
          link = '';

        if (el.selectedOpt && !this.foundSelected && !this.hasDefaultPlaceholder) {
          classes += 'cs-selected ';
          this.foundSelected = true;
        }
        // extra classes
        if (el.getAttribute('data-class')) {
          classes += el.getAttribute('data-class');
        }
        // link options
        if (el.getAttribute('data-link')) {
          link = 'data-link=' + el.getAttribute('data-link');
        }

        if (classes !== '') {
          optclass = 'class="' + classes + '" ';
        }

        return '<li ' + optclass + link + ' data-option data-value="' + el.value + '"><span>' + el.textContent + '</span></li>';
      };

    [].slice.call(this.el.children).forEach(function(el) {
      if (el.disabled) {
        return;
      }

      var tag = el.tagName.toLowerCase();

      if (tag === 'option') {
        options += createOptionHTML(el);
      } else if (tag === 'optgroup') {
        options += '<li class="cs-optgroup"><span>' + el.label + '</span><ul>';
        [].slice.call(el.children).forEach(function(opt) {
          options += createOptionHTML(opt);
        })
        options += '</ul></li>';
      }
    });

    var opts_el = '<div class="cs-options"><ul>' + options + '</ul></div>';
    this.selEl = document.createElement('div');
    this.selEl.className = this.el.className;
    this.selEl.tabIndex = this.el.tabIndex;
    this.selEl.innerHTML = '<span class="cs-placeholder">' + this.selectedOpt.textContent + '</span>' + opts_el;
    // console.log( this.el.parentNode );
    $(this.el).parent().prepend(this.selEl);
    $(this.selEl).prepend(this.el);
    // console.log( this.el );
  }


  /**
   * initialize the events
   */
  SelectFx.prototype._initEvents = function() {
    var self = this;

    // open/close select
    this.selPlaceholder.addEventListener('click', function() {
      self._toggleSelect();
    });

    // clicking the options
    this.selOpts.forEach(function(opt, idx) {
      opt.addEventListener('click', function() {
        self.current = idx;
        self._changeOption();
        // close select elem
        self._toggleSelect();
      });
    });

    // close the select element if the target it´s not the select element or one of its descendants..
    document.addEventListener('click', function(ev) {
      var target = ev.target;
      if (self._isOpen() && target !== self.selEl && !hasParent(target, self.selEl)) {
        self._toggleSelect();
      }
    });
  }

  /**
   * navigate with up/dpwn keys
   */
  SelectFx.prototype._navigateOpts = function(dir) {
    if (!this._isOpen()) {
      this._toggleSelect();
    }

    var tmpcurrent = typeof this.preSelCurrent != 'undefined' && this.preSelCurrent !== -1 ? this.preSelCurrent : this.current;

    if (dir === 'prev' && tmpcurrent > 0 || dir === 'next' && tmpcurrent < this.selOptsCount - 1) {
      // save pre selected current - if we click on option, or press enter, or press space this is going to be the index of the current option
      this.preSelCurrent = dir === 'next' ? tmpcurrent + 1 : tmpcurrent - 1;
      // remove focus class if any..
      this._removeFocus();
      // add class focus - track which option we are navigating
      classie.add(this.selOpts[this.preSelCurrent], 'cs-focus');
    }
  }

  /**
   * open/close select
   * when opened show the default placeholder if any
   */
  SelectFx.prototype._toggleSelect = function() {
    // remove focus class if any..
    this._removeFocus();
    // console.log(this.selPlaceholder.textContent )
    var txtparent = $(this.selPlaceholder).parent().parent();
    if (this._isOpen()) {
      if (this.current !== -1) {
        // update placeholder text
        this.selPlaceholder.textContent = this.selOpts[this.current].textContent;
        if (this.selPlaceholder.textContent == "单选") {
          $(txtparent).find(".single").show();
          $(txtparent).find(".fill").hide();
        } else if (this.selPlaceholder.textContent == "填空") {
          $(txtparent).find(".fill").show();
          $(txtparent).find(".single").hide();
        } else if (this.selPlaceholder.textContent == "文档") {
          $(txtparent).find(".file").show();
          $(txtparent).find(".txt").hide();
          $(txtparent).find(".video").hide();
          $(txtparent).find(".pic").hide();

        } else if (this.selPlaceholder.textContent == "文字") {
          $(txtparent).find(".txt").show();
          $(txtparent).find(".file").hide();
          $(txtparent).find(".video").hide();
          $(txtparent).find(".pic").hide();
        } else if (this.selPlaceholder.textContent == "视频") {
          $(txtparent).find(".txt").hide();
          $(txtparent).find(".file").hide();
          $(txtparent).find(".video").show();
          $(txtparent).find(".pic").hide();
        } else if (this.selPlaceholder.textContent == "图片") {
          $(txtparent).find(".txt").hide();
          $(txtparent).find(".file").hide();
          $(txtparent).find(".video").hide();
          $(txtparent).find(".pic").show();
        }

      }
      classie.remove(this.selEl, 'cs-active');
    } else {
      if (this.hasDefaultPlaceholder && this.options.stickyPlaceholder) {
        // everytime we open we wanna see the default placeholder text
        this.selPlaceholder.textContent = this.selectedOpt.textContent;
      }
      classie.add(this.selEl, 'cs-active');
      // $(classie).css({"height":"10px" });
    }
  }

  /**
   * change option - the new value is set
   */
  SelectFx.prototype._changeOption = function() {
      // if pre selected current (if we navigate with the keyboard)...
      if (typeof this.preSelCurrent != 'undefined' && this.preSelCurrent !== -1) {
        this.current = this.preSelCurrent;
        this.preSelCurrent = -1;
      }

      // current option
      var opt = this.selOpts[this.current];

      // update current selected value
      this.selPlaceholder.textContent = opt.textContent;

      // change native select element´s value
      this.el.value = opt.getAttribute('data-value');

      // remove class cs-selected from old selected option and add it to current selected option
      var oldOpt = this.selEl.querySelector('li.cs-selected');
      if (oldOpt) {
        classie.remove(oldOpt, 'cs-selected');
      }
      classie.add(opt, 'cs-selected');

      // if there´s a link defined
      if (opt.getAttribute('data-link')) {
        // open in new tab?
        if (this.options.newTab) {
          window.open(opt.getAttribute('data-link'), '_blank');
        } else {
          window.location = opt.getAttribute('data-link');
        }
      }
      // callback
      this.options.onChange(this.el.value);
    }
    /**
     * returns true if select element is opened
     */
  SelectFx.prototype._isOpen = function(opt) {
      return classie.has(this.selEl, 'cs-active');
    }
    /**
     * removes the focus class from the option
     */
  SelectFx.prototype._removeFocus = function(opt) {
    var focusEl = this.selEl.querySelector('li.cs-focus')
    if (focusEl) {
      classie.remove(focusEl, 'cs-focus');
    }
  }

  /**
   * add to global namespace
   */
  window.SelectFx = SelectFx;

})(window);

var createSelect = function() {
  [].slice.call(document.querySelectorAll('select.cs-select')).forEach(function(el) {
    new SelectFx(el);
  });
};
createSelect();

// click add===========
$(".btn.add").on("click", function() {
  $(".q3.none").last().removeClass("none");
});

// close============
$(".close").on("click", function() {
  $(this).parent().addClass("none");
});
