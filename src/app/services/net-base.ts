/**
 * author: jsongo
 * desc: angular2请求模块的基类，建一个新的请求时，继承它就可以调用get/post/delete等方法
 */
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/finally';

const API_BASE_URL = 'https://api.ngbook.net/';

@Injectable()
export class RequestBase {

    constructor(protected http: Http) { }

    /**
     * Post 请求
     */
    protected post( urlWithoutDomain: string, // request url without domain
                    data?: any): Observable<any> {
        const url = API_BASE_URL + urlWithoutDomain;
        return this.makeRequest('post', url, data);
    }

    /**
     * Get 请求
     */
    protected get(  urlWithoutDomain: string,
                    params: string | Object): Observable<any> {
        if (typeof params === 'object') {
            params = this.obj2urlParam(params);
        }
        const url = API_BASE_URL + urlWithoutDomain + '?' + params;
        return this.makeRequest('get', url);
    }

    /**
     * delete 请求
     */
    protected delete(urlWithoutDomain: string,
                     param: string = ''): Observable<any> {
        const url = API_BASE_URL + urlWithoutDomain + '?' + param;
        return this.makeRequest('delete', url);
    }

    /**
     * 创建真正的请求，并发送
     */
    private makeRequest(reqMethod: string,
                        url: string, data?: any): Observable<any> {
        const headers = this.wrapHeader();
        const options = new RequestOptions({ headers });
        let observe: Observable<Response>;
        if (reqMethod === 'post') {
            headers.append('Content-Type', 'application/json');
            observe = this.http.post(url, data, options);
        } else if (reqMethod === 'delete') {
            observe = this.http.delete(url, options);
        } else { // 默认用get请求
            observe = this.http.get(url, options);
        }
        return observe.map(this.extractData.bind(this))
            .catch((error) => this.handleError(error, headers));
    }

    /**
     * 定制请求头等 通用请求部分
     */
    private wrapHeader(): Headers {
        const headers = new Headers();
        const authToken = localStorage.getItem('auth');
        headers.append('Authorization', authToken);
        return headers;
    }

    private extractData(rsp: Response) {
        const rspHeaders = rsp.headers;
        const contentType = rspHeaders.get('Content-Type');
        if ( contentType.substr(0, 16) === 'application/json') {
            const body = rsp.json() || {};
            if ( body ) {
                if ( body.code !== 200) {
                    return this.processRsp(body, rspHeaders);
                }
                return {body, headers: rspHeaders};
            } else {
                return null;
            }
        } else { // 返回非json格式的情况（比如文件下载）
            return rsp;
        }
    }

    private handleError (error: Response | any, headers: Headers) {
        if (error instanceof Response) {
            const body = error.json();
            if (body) {
                return Observable.of(this.processRsp(body, headers));
            }
        }
        return Observable.of({body: error, headers});
    }

    private processRsp(body: any, headers: Headers) {
        const code = body && body.code;
        // 对共同code做处理。case里如果没必要做下一步处理的，直接return就行
        switch (code) {
            case 1001: // 未知错误
                // alert('服务器繁忙');
                console.log('未知错误');
                break;
            case 1005: // token已过期
                // 提示错误，可能还要跳到登录页
                break;
            // ... other cases
            default:
                // default handler...
                break;
        }
        return {body, headers};
    }

    private obj2urlParam(data: Object): string {
        return Object.keys(data).map( (key) => {
            return encodeURIComponent(key) + '='
                + encodeURIComponent(data[key]);
        }).join('&');
    }

}
