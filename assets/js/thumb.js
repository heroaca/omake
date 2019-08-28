/**
 * main.js
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2015, Codrops
 * http://www.codrops.com
 */
;(function(window) {

	'use strict';

	var support = { animations : Modernizr.cssanimations },
		animEndEventNames = { 'WebkitAnimation' : 'webkitAnimationEnd', 'OAnimation' : 'oAnimationEnd', 'msAnimation' : 'MSAnimationEnd', 'animation' : 'animationend' },
		animEndEventName = animEndEventNames[ Modernizr.prefixed( 'animation' ) ],
		onEndAnimation = function( el, callback ) {
			var onEndCallbackFn = function( ev ) {
				if( support.animations ) {
					if( ev.target != this ) return;
					this.removeEventListener( animEndEventName, onEndCallbackFn );
				}
				if( callback && typeof callback === 'function' ) { callback.call(); }
			};
			if( support.animations ) {
				el.addEventListener( animEndEventName, onEndCallbackFn );
			}
			else {
				onEndCallbackFn();
			}
		};

	// from http://www.sberry.me/articles/javascript-event-throttling-debouncing
	function throttle(fn, delay) {
		var allowSample = true;

		return function(e) {
			if (allowSample) {
				allowSample = false;
				setTimeout(function() { allowSample = true; }, delay);
				fn(e);
			}
		};
	}

	// sliders - flickity
	var sliders = [].slice.call(document.querySelectorAll('.slider')),
		// array where the flickity instances are going to be stored
		flkties = [],
		// grid element
		grid = document.querySelector('.grid'),
		// isotope instance
		iso,
		// filter ctrls
		filterCtrls = [].slice.call(document.querySelectorAll('.filter > button')),
		// quick search
		quicksearch = document.getElementById("quicksearch"),
		searchString = [],
		qsRegex,
		buttonFilter,
		// cart
		cart = document.querySelector('.cart');

	function init() {
		// preload images
		imagesLoaded(grid, function() {
			getFilters();

			initFlickity();
			initIsotope();

			initEvents();
			new ClipboardJS('.action--buy');
			new ClipboardJS('.slider__item');

			arrangeIso();
			
			grid.classList.remove('grid--loading');
		});
	}

	function initFlickity() {
		sliders.forEach(function(slider){
			var flkty = new Flickity(slider, {
				prevNextButtons: false,
				wrapAround: true,
				cellAlign: 'left',
				contain: true,
				pageDots: false,
				resize: false
			});

			// store flickity instances
			flkties.push(flkty);
		});
	}

	function initIsotope() {
		iso = new Isotope( grid, {
			isResizeBound: false,
			itemSelector: '.grid__item',
			percentPosition: true,
			masonry: {
				// use outer width of grid-sizer for columnWidth
				columnWidth: '.grid__sizer'
			},
			// transitionDuration: '0.6s',
			transitionDuration: 0,
			hiddenStyle: {
				opacity: 0
			},
			visibleStyle: {
				opacity: 1
			}
		});
	}

	function initEvents() {
		filterCtrls.forEach(function(filterCtrl) {
			filterCtrl.addEventListener('click', function() {
				buttonFilter = filterCtrl.getAttribute('data-filter');
				searchString = '(?=.*' + quicksearch.value.split(/\,|\s/).join(')(?=.*') + ')';
				qsRegex = new RegExp( searchString, 'gi' );

				filterCtrl.parentNode.querySelector('.filter__item--selected').classList.remove('filter__item--selected');
				filterCtrl.classList.add('filter__item--selected');
				iso.arrange({
					// filter: filterCtrl.getAttribute('data-filter')
					filter: function() {
						var $this = $(this);

						var searchResult = qsRegex ? $this.text().match( qsRegex ) : true;
						var buttonResult = buttonFilter ? $this.is( buttonFilter ) : true;
						return searchResult && buttonResult;
					}
				});
				recalcFlickities();
				iso.layout();
			});
		});

		// use value of search field to filter
		// quicksearch.addEventListener('keyup', throttle(function(ev) {
		document.querySelector('.search-button').addEventListener('click', throttle(function(ev) {
			searchString = '(?=.*' + quicksearch.value.split(/\,|\s/).join(')(?=.*') + ')';
			qsRegex = new RegExp( searchString, 'gi' );
			iso.arrange({
				filter: function() {
					var $this = $(this);

					var searchResult = qsRegex ? $this.text().match( qsRegex ) : true;
					var buttonResult = buttonFilter ? $this.is( buttonFilter ) : true;
					return searchResult && buttonResult;
				}
			});
			recalcFlickities();
			iso.layout();
		}));

		quicksearch.addEventListener("keyup", function(event) {
			event.preventDefault();
			if (event.keyCode === 13) {
				document.querySelector('.search-button').click();
			}
		});

		// window resize / recalculate sizes for both flickity and isotope/masonry layouts
		window.addEventListener('resize', throttle(function(ev) {
			recalcFlickities()
			iso.layout();
		}, 50));
	}

	// URL PARAMS
	function getUrlVars() {
		var vars = {};
		var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
			vars[key] = value;
		});
		return vars;
	}

	function getUrlParam(parameter, defaultvalue){
		var urlparameter = defaultvalue;
		if(window.location.href.indexOf(parameter) > -1){
			urlparameter = getUrlVars()[parameter];
		}
		return urlparameter;
	}

	function getFilters() {
		var urlString = getUrlParam('s', '');

		if (urlString != "" && urlString) {
			quicksearch.value = decodeURI(urlString).split(/\+|\,|\-|\_/).join(' ');
		}
	}

	function arrangeIso() {
		// searchString = '(?=.*' + urlString.split(/\+|\s/).join(')(?=.*') + ')';
		searchString = '(?=.*' + quicksearch.value.split(/\,|\s/).join(')(?=.*') + ')';
		qsRegex = new RegExp( searchString, 'gi' );
		iso.arrange({
			filter: function() {
				var $this = $(this);

				var searchResult = qsRegex ? $this.text().match( qsRegex ) : true;
				var buttonResult = buttonFilter ? $this.is( buttonFilter ) : true;
				return searchResult && buttonResult;
			}
		});
		recalcFlickities();
		iso.layout();
	}

	function recalcFlickities() {
		for(var i = 0, len = flkties.length; i < len; ++i) {
			flkties[i].resize();
		}
	}

	init();

})(window);