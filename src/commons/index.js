import {isDev, isPro, isTest, isRC} from 'sx-ui';
import {session} from 'sx-ui/utils/storage';
import devAjaxBaseUrl from '../../local/local-ajax-base-url';
import mockUrls from '../mock/url-config';

import deployAjaxBaseUrl from '../../ajax-config';
export function getAjaxBaseUrl() {
    console.log('isDev, isPro, isTest, isRC',isDev, isPro, isTest, isRC);
    if (isDev) {
        return devAjaxBaseUrl;
    }
    if (isPro) {
	return deployAjaxBaseUrl.production;
    }

    if (isTest) {
	return deployAjaxBaseUrl.test;
    }

    if (isRC) {
	return deployAjaxBaseUrl.rc;
    }

    if (process.env.NODE_ENV == "dev") {
	return deployAjaxBaseUrl.dev;
    }
    return '/';
}

// 这里由于keyPrefix 要设置成 currentLoginUser.id 的原因，无法使用封装过的storage
export function getCurrentLoginUser() {
    const currentLoginUser = window.sessionStorage.getItem('currentLoginUser');
    return currentLoginUser ? JSON.parse(currentLoginUser) : null;
}

export function setCurrentLoginUser(currentLoginUser) {
    window.sessionStorage.setItem('currentLoginUser', JSON.stringify(currentLoginUser));
}

export function getMenuTreeData() {
    return session.getItem('menuTreeData');
}

export function setMenuTreeData(menuTreeData) {
    session.setItem('menuTreeData', menuTreeData);
}

export function toLogin() {
    return window.location.href = '/login.html';
}

export function isMock(url /* url, data, method, options */) {
    return mockUrls.indexOf(url) > -1 || url.startsWith('/mock');
}
