import { Injectable } from '@angular/core';
import { DataSpan } from './ng-pager.model';

// 缓存控制器，支持多维度
export class PageCache {
    public cache = {}; // 记录所有list数据的
    public total = 0;
    public hasData = false; // 是否真的有数据，如果用户没有使用这个缓存控制器的话，hasData就是false
    private markers = {}; // 用来标记哪些列表项已经加载好了
    private key: string | number = 0; // 维度标识，可以用数字

    public addToList(rows, start) { // What this does is actually replacement.
        let list = this.getList();
        if (list) {
            if (list.length < start) {
                for (let i = list.length; i < start; i ++) {
                    list[i] = {};
                }
            }
            // 设备index
            rows.forEach((item, index) => {
                if (typeof item === 'object') {
                    item.index = start + index;
                }
            });
            list.splice(start, rows.length, ...rows);
            this.hasData = true;
        }
        // set markers
        let markers = this.markers[this.key];
        let end = start + rows.length;
        for (let i = start; i < end; i ++) {
            markers[i] = true;
        }
    }
    public prepend(arr: any[]) {
        let list = this.getList();
        if (list) {
            list.splice(0, 0, ...arr);
            list.forEach((item, index) => {
                if (typeof item === 'object') {
                    item.index = index;
                }
            });
            this.total += arr.length;
        }
    }
    public append(arr: any[]) {
        let list = this.getList();
        if (list) {
            let oriLen = list.length;
            list.splice(oriLen, 0, ...arr);
            arr.forEach((item, index) => {
                if (typeof item === 'object') {
                    item.index = index + oriLen;
                }
            });
            this.total += arr.length;
        }
    }
    public reset() {
        this.total = 0;
        this.cache = {};
    }

    public setTotal(total) {
        this.total = total;
    }
    public setCurKey(key) { // 切换维度
        this.key = key;
    }

    // 获取全部的列表（key）
    public getList() {
        let list: any[];
        list = this.cache[this.key];
        if (!list) {
            this.cache[this.key] = list = [];
            this.markers[this.key] = [];
        }
        return list;
    }
    public getListOf(span: DataSpan) {
        let list = this.getList();
        if (list) {
            return list.slice(span.start, span.end);
        }
        return null;
    }
    public delFromList(opt) {
        if (!opt || opt.index === undefined && !opt.item) {
            return -1;
        }
        let list = this.getList();
        if (opt.index !== undefined) {
            return this.removeItem(opt.index, list);
        } else {
            if (opt.item) {
                let index = list.indexOf(opt.item);
                if (!index) {
                    return -1;
                } else {
                    return this.removeItem(index, list);
                }
            } else {
                return -1;
            }
        }
    }

    // 查看接下去的页面有没有缓存，没有的话，返回需要加载的start和end
    public checkCache(  start: number, end: number,
                        leastFetch?: number): DataSpan {
        let list = this.getList();
        if (list) {
            if (list.length > 0) { // 这时total肯定有值
                if (end > this.total) {
                    end = this.total;
                }
                return this.getRealSeg(start, end, leastFetch);
            } else { // 第一次请求
                return { start, end };
            }
        }
    }
    public isItExist(index) {
        let markers = this.markers[this.key];
        return markers && markers[index];
    }

    // // 删除，同时调整index
    // private removeItem(index, list) {
    //     if (!list || list.length <= 0) {
    //         return;
    //     }
    //     let deleted = list.splice(index, 1);
    //     let len = list.length;
    //     for (let i = index; i < len; i ++) {
    //         let item = list[i];
    //         if (item) {
    //             item.index = i;
    //         }
    //     }
    //     // 更新marker
    //     let markers = this.markers[this.key];
    //     if (markers) {
    //         markers.splice(index, 1);
    //     }
    //     return {
    //         index,
    //         data: deleted
    //     };
    // }
    private getRealSeg(start, end, leastFetch?) { // 计算分段
        let segs = 0; // 分段数

        let markers = this.markers[this.key];
        if (markers.length < start) {
            return {start, end};
        }
        let flag = false;
        let tmpStart = start;
        let tmpEnd = end;
        let tmpCnt = 0;

        let firstStart: number; // 第一次检测到的分段的开头
        let lastEnd = end; // 第一次检测到的分段的开头

        for (let i = start; i < end; i ++) {
            if (segs > 1) { // 分段超过1个
                lastEnd = tmpEnd;
                // 从后往前找最后一个有数据的地方
                for (let j = end - 1; j > i; j --) {
                    if (markers[j - 1] === undefined) {
                        lastEnd = j;
                        break;
                    }
                }
                // console.log(lastEnd);
                return {
                    start: firstStart, // 此时的firstStart不可能为空
                    end: lastEnd
                };
            }
            let marker = markers[i];
            if (marker === undefined) {
                if (!flag) {
                    // 出现undefined的时候，tmpStart才会变化
                    tmpStart = i;
                    if (!firstStart) {
                        firstStart = tmpStart;
                    }
                    segs ++;
                }
                flag = true;
                tmpEnd = i + 1; // tmpEnd总指向最后一个没数据的index+1
            } else {
                tmpCnt ++;
                flag = false;
            }
        }
        if (tmpCnt === end - start) { // 全都存在
            return null;
        }
        if (leastFetch && tmpEnd === end) {
            if (tmpEnd - tmpStart <= leastFetch) {
                let pageSize = leastFetch / LEAST_FETCHING_PERCENT;
                tmpEnd += pageSize; // 多取一页
            }
        }
        return {
            start: tmpStart,
            end: tmpEnd
        };
    }
}
