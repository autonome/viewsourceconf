(function() {
    'use strict';

    /*
        Basic expand/collapse utilities
    */

    var isHash = false;
    var targetId = null;
    if(window.location.hash) {
        isHash = true;
        targetId = window.location.hash;
        targetId = targetId.replace('#', '');
    }

    // adds ARIA attributes to associate controller and expanded
    function expandInitController(controller, controlledId) {
        // add aria to controller
        controller.setAttribute('aria-controls', controlledId);
        controller.setAttribute('aria-expanded', 'false');
        return controller;
    }

    // given a controller and controlled, sets ARIA attributes to expanded
    function expandOpen(controller) {
        controller.setAttribute('aria-expanded', 'true');
        return controller;
    }

    // given a controller and controlled, sets ARIA attributes to collapsed
    function expandClose(controller) {
        // update expanded to show it's closed
        controller.setAttribute('aria-expanded', 'false');
        return controller;
    }

    function expandSimple(event, controller, controlled) {
        if (controller.getAttribute('aria-expanded') === 'true') {
            // toggle aria
            expandClose(controller);
            // toggle visibility
            controlled.classList.add('js-hidden');
            expandCleanURL();
        } else {
            //toggle aria
            expandOpen(controller);
            controlled.classList.remove('js-hidden');
            if(controlled.id) {
                location.href = '#' + controlled.id;
            }
        }
    }

    function expandCleanURL() {
        // remove #hash from location http://stackoverflow.com/questions/1397329/how-to-remove-the-hash-from-window-location-with-javascript-without-page-refresh/5298684#5298684
        if ("pushState" in history) {
            history.pushState('', document.title, location.pathname + location.search);
        }
    }

    /*
        hotels expand/collapse
    */
    var hotelDivId = 'hotels_suggestions';
    var hotelsDiv = document.getElementById(hotelDivId);

    if(hotelsDiv) {
        // add button
        var hotelsButton = document.createElement('button');
        hotelsButton.setAttribute('type', 'button');
        var hotelsButtonTextExpanded = 'Hide suggested hotels';
        var hotelsButtonTextCollapsed = 'Show suggested hotels';
        hotelsButton.appendChild(document.createTextNode(hotelsButtonTextCollapsed));
        hotelsButton.classList.add('hotels_button');
        hotelsButton.classList.add('button');
        hotelsButton.classList.add('button-expand');
        hotelsDiv.parentNode.insertBefore(hotelsButton, hotelsDiv);
        // wire button as controller
        expandInitController(hotelsButton, hotelDivId);
        // add listener for button
        hotelsButton.addEventListener('click', function(event) {
            // toggle aria and visibililty
            expandSimple(event, hotelsButton, hotelsDiv);
            // toggle button text
            if (hotelsButton.getAttribute('aria-expanded') === 'true') {
                hotelsButton.textContent = hotelsButtonTextExpanded;
            } else {
                hotelsButton.textContent = hotelsButtonTextCollapsed;
            }
        }, false);

        if(isHash) {
            if(targetId === hotelDivId){
                hotelsButton.click();
            }
        }
    }

    /*
        session expand/collapse
    */

    var summaryDivs = document.querySelectorAll('.session_summary');

    if(summaryDivs) {
        var sessionTitleCTATextCollapsed = 'More…';
        var sessionTitleCTATextExpanded = 'Less';

        Array.prototype.forEach.call(summaryDivs, function(element, i) {
            var summary = element;
            // get parent div
            var sessionParent = window.vs.utils.parentByClass(summary, 'session_details');
            // get what we need to figure out session_title
            var sessionTitle = sessionParent.querySelector('.session_title');
            var sessionTitleText = sessionTitle.innerHTML + ' • ';
            var sessionTitleCTA = document.createElement('span');
            sessionTitleCTA.classList.add('session_cta');


            // create button to replace session_title
            var sessionButton = document.createElement('button');
            sessionButton.setAttribute('type', 'button');
            sessionButton.classList.add('session_title');

            // insert button
            sessionTitle.parentNode.insertBefore(sessionButton, sessionTitle);
            // add text to button (button needs to be in DOM before we append childen, thank you Chrome)
            sessionButton.appendChild(document.createTextNode(sessionTitleText));
            sessionButton.appendChild(sessionTitleCTA);
            sessionTitleCTA.appendChild(document.createTextNode(sessionTitleCTATextCollapsed));
            // remove old session_title
            sessionTitle.parentNode.removeChild(sessionTitle);

            // get session_summary ID
            var summaryId = summary.id;
            // init controller
            expandInitController(sessionButton, summaryId);
            // add listener
            sessionButton.addEventListener('click', function(event) {
                expandSimple(event, sessionButton, summary);
                if (sessionButton.getAttribute('aria-expanded') === 'true') {
                    sessionTitleCTA.textContent = sessionTitleCTATextExpanded;
                } else {
                    sessionTitleCTA.textContent = sessionTitleCTATextCollapsed;
                }
            }, false);
        });

        if(isHash) {
            var matchesSummary = document.querySelector('.session button[aria-controls="' + targetId + '"]');
            var matchesParent = document.querySelector('.session button[aria-controls="' + targetId + '_summary"]');
            if(matchesParent || matchesSummary) {
                var matchedController = matchesSummary ? matchesSummary : matchesParent;
                var matchedControlled = matchesSummary ? document.getElementById(targetId) : document.getElementById(targetId + '_summary');
                var cta = matchedController.querySelector('.session_cta');
                expandOpen(matchedController);
                matchedControlled.classList.remove('js-hidden');
                cta.textContent = sessionTitleCTATextExpanded;
            }
        }
    }
})();
