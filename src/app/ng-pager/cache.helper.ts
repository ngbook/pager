import { Injectable } from '@angular/core';
import { DataSpan, LEAST_FETCHING_PERCENT } from './other.model';

// 缓存控制器，支持多维度
export class PageCache {
    public cache = {}; // 记录所有list数据的
    public total = 0;
    public hasData = false; // 是否真的有数据，如果用户没有使用这个缓存控制器的话，hasData就是false
    private markers = {}; // 用来标记哪些列表项已经加载好了
    private key: string | number = 0; // 维度标识，可以用数字
    public addToList(rows, start) {
        let list = this.getList();
        if (list) {
            if (list.length < start) {
                for (let i = list.length; i < start; i ++) {
                    list[i] = {};
                }
            }
            // 设置index
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
    // 获取当前维度的全部列表（key）
    public getList() {
        let list: any[];
        list = this.cache[this.key];
        if (!list) {
            this.cache[this.key] = list = [];
            this.markers[this.key] = [];
        }
        return list;
    }
    public reset() {
        this.total = 0;
        this.cache = {};
    }
    public setCurKey(key: number | string) { // 切换维度
        this.key = key;
    }

    // 获取指定下标范围的一段数据
    public getListOf(span: DataSpan) {
        let list = this.getList();
        if (list) {
            return list.slice(span.start, span.end);
        }
        return null;
    }

    public setTotal(total) {
        this.total = total;
    }
    // 查看接下去的页面有没有缓存，没有的话，返回需要加载的start和end
    public checkCache(  start: number, end: number,
                        leastFetch?: number): DataSpan {
        let list = this.getList();
        if (list) {
            if (list.length > 0) {
                if (end > this.total) {
                    end = this.total;
                }
                return this.getRealSeg({start, end}, leastFetch);
            } else { // 第一次请求
                return { start, end };
            }
        }
    }

    // 计算分段
    private getRealSeg(span: DataSpan, leastFetch: number) {
        let markers = this.markers[this.key];
        let start = span.start;
        let end = span.end;
        if (markers.length < start) {
            return {start, end};
        }
        let firstStart: number = -1; // 第一次检测到的分段的开头
        let lastEnd = end; // 第一次检测到的分段的结尾
        for (let i = start; i < end; i ++) {
            let marker = markers[i];
            if (marker === undefined) {
                firstStart = i;
                for (let j = end; j >= i; j --) {
                    if (markers[j - 1] === undefined) {
                        lastEnd = j;
                        break;
                    }
                }
                break;
            }
        }
        // console.log(firstStart, lastEnd);
        if (firstStart < 0) { // 全都存在
            return null;
        }
        if (leastFetch) {
            if (lastEnd - firstStart <= leastFetch // 要取的小于最小值
                && end - lastEnd > leastFetch) { // 后面剩余的一段比较小
                lastEnd = firstStart + leastFetch; // 多取一页
            }
        }
        return {
            start: firstStart,
            end: lastEnd
        };
    }
}
