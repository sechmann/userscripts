// ==UserScript==
// @name         Gcloud auto select account
// @version      0.0.1
// @description  Select my NAV gcloud account automatically and approve access
// @author       Vegar Sechmann Molvig
// @match        https://accounts.google.com/o/oauth2/auth*
// @match        https://accounts.google.com/signin/oauth/consent*
// @match        https://accounts.google.com/signin/v2/challenge/pwd*
// @match        https://accounts.google.com/v3/signin/challenge/pwd*
// @match        https://accounts.google.com/signin/oauth/id*
// ==/UserScript==
(function () {
    'use strict';
    const initialDelay = 500;
    const retryInterval = 100;

    console.log("autologin")

    function docReady(fn) {
        // see if DOM is already available
        if (document.readyState === "complete" || document.readyState === "interactive") {
            // Ready, wait a bit and make the call
            setTimeout(fn, initialDelay);
        } else {
            document.addEventListener("DOMContentLoaded", function () {
                // When ready, wait a bit more before calling
                setTimeout(fn, initialDelay);
            });
        }
    }


    function selectAccount() {
        const getEmailFromUrl = () => {
            //https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
            const params = new Proxy(new URLSearchParams(window.location.search), {
                get: (searchParams, prop) => searchParams.get(prop),
            })

            return params.autoAccountSelect
        }

        const email = getEmailFromUrl()
        if (!email) {
            console.log("select: no 'autoAccountSelect' query parameter, stopping script")
            return
        }

        const fn = () => {
            console.log("select: checking for account selector")
            let accountSelector = document.querySelector(`[data-identifier="${email}"]`);
            if (!accountSelector) {
                console.log("select: no account select found (yet)")
                return setTimeout(selectAccount(), retryInterval)
            }

            accountSelector.click()
        }

        return fn
    }

    function approve() {
        const fn = () => {
            console.log("approve: checking for approve access button")
            let submitButton = document.querySelector('[id="submit_approve_access"]');
            if (!submitButton) {
                console.log("approve: no approve button (yet, retrying)")
                return setTimeout(approve(), retryInterval)
            }

            submitButton.click()
        }

        return fn
    }


    function login() {
        const fn = () => {
            console.log("login: checking for next button")
            const nextButton = document.querySelector('[id="passwordNext"]')
            if (!nextButton) {
                console.log("login: no next button (yet, retrying)")
                return setTimeout(login(), retryInterval)
            }

            console.log("login: checking for password input")
            const passwordInput = document.querySelector('[aria-label="Enter your password"]')
            if (!passwordInput) {
                console.log("login: no password input (yet, retrying)")
                return setTimeout(login(), retryInterval)
            }
            console.log("login: checking for password input value")
            if (!passwordInput.value.length > 0) {
                console.log("login: no password value (yet, retrying)")
                return setTimeout(login(), retryInterval)
            }

            console.log("login: clicking next")
            nextButton.click()
        }
        return fn
    }

    function loginv3() {
        const fn = () => {
            console.log("login: checking for next button")
            const nextButton = document.querySelector('[id="passwordNext"]')
            if (!nextButton) {
                console.log("login: no next button (yet, retrying)")
                return setTimeout(login(), retryInterval)
            }

            console.log("login: checking for password input")
            const passwordInput = document.querySelector('[name="password"]')
            if (!passwordInput) {
                console.log("login: no password input (yet, retrying)")
                return setTimeout(login(), retryInterval)
            }
            console.log("login: checking for password input value")
            if (!passwordInput.value.length > 0) {
                console.log("login: no password value (yet, retrying)")
                return setTimeout(login(), retryInterval)
            }

            console.log("login: clicking next")
            nextButton.click()
        }
        return fn
    }

    function clickContinue() {
        const fn = () => {
            console.log("continue: checking for button")
            for (const s of document.querySelectorAll("button>span")) {
                console.log(s.innerHTML)
                if (s.innerHTML === "Continue"){
                    console.log("continue: clicking")
                    s.click()
                    return
                }
            }
        }
        return fn
    }

    [
        { pathStartsWith: "/o/oauth2/auth", handler: selectAccount },
        { pathStartsWith: "/signin/oauth/consent", handler: approve },
        { pathStartsWith: "/signin/v2/challenge/pwd", handler: login },
        { pathStartsWith: "/v3/signin/challenge/pwd", handler: loginv3 },
        { pathStartsWith: "/signin/oauth/id", handler: clickContinue},

    ].forEach((e) => {
        if (window.location.href.startsWith("https://accounts.google.com" + e.pathStartsWith)) {
            console.log("match:", window.location.href, e.handler)
            docReady(e.handler())
        } else {
            console.log("no match:", window.location.href, e.pathStartsWith)
        }
    })
})();
