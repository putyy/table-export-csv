var exportApp = {
    data: {
        csvFileName: '',
        tableExportNameMark: 1,
        isDownLoadingCurrentPage: false,
        isDownLoadingAllPage: false,
    },
    main: function () {
        this.data.csvFileName = $(".content-header h1").contents().filter(function (index, content) {
            return content.nodeType === 3;
        }).text().replaceAll(/\s*/g, "");
        this.event();
    },
    event: function () {
        if (!window.tableExportToCsv_isBind) {
            window.tableExportToCsv_isBind = true;
            $('#pjax-container').on('click', '#exportCurrentPage', function () {
                var tmp = [];
                var data = [];

                if (exportApp.isDownLoadingCurrentPage) {
                    return;
                }

                if ($(".grid-table tbody .empty-grid") === 1) {
                    return;
                }

                exportApp.isDownLoadingCurrentPage = true;
                data = currentPageTableHeader();
                $(".grid-table tbody tr").each(function (index, item) {
                    tmp = [];
                    $(item).find('td').each(function (key, value) {
                        var res = currentPageColumnHandle(value)
                        if (res) {
                            tmp.push(res);
                        } else {
                            if ($(value).hasClass('column-__row_selector__') || $(value).hasClass('column-__actions__')) {
                                return true;
                            }
                            tmp.push("`" + exportApp.filterEmoji($(value).text().replace(/(^\s*)|(\s*$)|(,)|([\r\n])/g, "")) + "`");
                        }
                    });
                    data += tmp.join(",") + "\n";
                })

                exportApp.downCsv(data, exportApp.data.csvFileName + '(当前页)' + exportApp.data.tableExportNameMark);
                exportApp.data.tableExportNameMark += 1;
                exportApp.isDownLoadingCurrentPage = false;
            });

            $('#pjax-container').on('click', '#exportAllPage', function () {

                if (exportApp.isDownLoadingAllPage) {
                    return;
                }

                if ($(".grid-table tbody .empty-grid") === 1) {
                    return;
                }

                exportApp.isDownLoadingAllPage = true;
                var tmp = [];
                var data = allPageTableHeader();
                var locationUrlParseRes = exportApp.parseURL(window.location.href)
                var page = 1;
                var maxPage = parseInt($(".pagination .page-link").eq(-2).text());
                var queryOld = locationUrlParseRes.params || {};
                var url = locationUrlParseRes.protocol + '://' + locationUrlParseRes.host + (locationUrlParseRes.port ? ":" + locationUrlParseRes.port : '') + locationUrlParseRes.path + "?";
                var isBreak = false;
                while (true) {
                    var query = exportApp.objectClone(queryOld)
                    query.page = page;
                    query.per_page = 500;
                    query._pjax = "#pjax-container";
                    var uri = url + exportApp.buildUrlQuery(query);
                    $.ajax({
                        method: 'get',
                        headers: {
                            "X-PJAX": true,
                            "X-PJAX-Container": "#pjax-container",
                        },
                        crossDomain: true,
                        xhrFields: {
                            withCredentials: true
                        },
                        async: false,
                        url: uri,
                        success: function (resHtml) {
                            maxPage = parseInt($(resHtml).find(".pagination .page-link").eq(-2).text());
                            if (maxPage == "NaN") {
                                isBreak = true;
                                return;
                            }
                            $(resHtml).find("table>tbody>tr").each(function (index, item) {
                                tmp = [];
                                $(item).find('td').each(function (key, value) {
                                    var res = allPageColumnHandle(value)
                                    if (res) {
                                        tmp.push(res);
                                    } else {
                                        if ($(value).hasClass('column-__row_selector__') || $(value).hasClass('column-__actions__')) {
                                            return true;
                                        }
                                        tmp.push("`" + exportApp.filterEmoji($(value).text().replace(/(^\s*)|(\s*$)|(,)|([\r\n])/g, "")) + "`");
                                    }
                                });
                                data += tmp.join(",") + "\n";
                            })
                        }
                    });
                    if (page >= maxPage || isBreak) {
                        break;
                    }
                    page += 1;
                }
                exportApp.downCsv(data, exportApp.data.csvFileName + '(全部)' + exportApp.data.tableExportNameMark);
                exportApp.data.tableExportNameMark += 1;
                exportApp.isDownLoadingAllPage = false;
            });
        }
    },
    /**
     * 导出csv.
     * @param data
     * @param name
     */
    downCsv: function (data, name) {
        var uri = 'data:text/csv;charset=utf-8,\ufeff' + encodeURIComponent(data);
        var downloadLink = document.createElement("a");
        downloadLink.href = uri;
        downloadLink.download = (name + ".csv") || "temp.csv";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    },
    /**
     * 过滤表情.
     * @param emojiReg
     * @returns {*}
     */
    filterEmoji: function filterEmoji(emojiReg) {
        var ranges = [
            '\ud83c[\udf00-\udfff]',
            '\ud83d[\udc00-\ude4f]',
            '\ud83d[\ude80-\udeff]'
        ];
        return emojiReg.replace(new RegExp(ranges.join('|'), 'g'), '');
    },
    /**
     * 克隆对象
     * @param source
     * @param target
     * @returns {{}}
     */
    objectClone: function (source, target) {
        var tmp;
        target = target || {};
        for (var i in source) {
            if (source.hasOwnProperty(i)) {
                tmp = source[i];
                if (typeof tmp == 'object') {
                    target[i] = utils.isArray(tmp) ? [] : {};
                    utils.clone(source[i], target[i])
                } else {
                    target[i] = tmp;
                }
            }
        }
        return target;
    },
    /**
     * 解析指定url
     * @param url
     * @returns {{path: string, protocol: string, file, port: string, query: string, host: string, source, params: {}, hash: string, relative, segments: string[]}}
     */
    parseURL: function parseURL(url) {
        var a = document.createElement('a');
        a.href = url;
        return {
            source: url,
            protocol: a.protocol.replace(':', ''),
            host: a.hostname,
            port: a.port,
            query: a.search,
            params: (function () {
                var ret = {},
                    seg = a.search.replace(/^\?/, '').split('&'),
                    len = seg.length, i = 0, s;
                for (; i < len; i++) {
                    if (!seg[i]) {
                        continue;
                    }
                    s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }
                return ret;
            })(),
            file: (a.pathname.match(/\/([^\/?#]+)$/i) || [, ''])[1],
            hash: a.hash.replace('#', ''),
            path: a.pathname.replace(/^([^\/])/, '/$1'),
            relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [, ''])[1],
            segments: a.pathname.replace(/^\//, '').split('/')
        };
    },
    /**
     * 对象转url参数.
     * @param {*} data,对象
     * @param {*} isPrefix,是否自动加上"?"
     */
    buildUrlQuery: function (data = {}, isPrefix = false, arrayFormat = 'brackets') {
        let prefix = isPrefix ? '?' : ''
        let _result = []
        if (['indices', 'brackets', 'repeat', 'comma'].indexOf(arrayFormat) == -1) arrayFormat = 'brackets';
        for (let key in data) {
            let value = data[key]
            // 去掉为空的参数
            if (['', undefined, null].indexOf(value) >= 0) {
                continue;
            }
            // 如果值为数组，另行处理
            if (value.constructor === Array) {
                /* e.g. {ids: [1, 2, 3]}*/
                switch (arrayFormat) {
                    case 'indices':
                        /* 结果: ids[0]=1&ids[1]=2&ids[2]=3 */
                        for (let i = 0; i < value.length; i++) {
                            _result.push(key + '[' + i + ']=' + value[i]);
                        }
                        break;
                    case 'brackets':
                        /*结果: ids[]=1&ids[]=2&ids[]=3*/
                        value.forEach(_value => {
                            _result.push(key + '[]=' + _value);
                        });
                        break;
                    case 'repeat':
                        // 结果: ids=1&ids=2&ids=3
                        value.forEach(_value => {
                            _result.push(key + '=' + _value);
                        });
                        break;
                    case 'comma':
                        // 结果: ids=1,2,3
                        let commaStr = "";
                        value.forEach(_value => {
                            commaStr += (commaStr ? "," : "") + _value;
                        });
                        _result.push(key + '=' + commaStr);
                        break;
                    default:
                        value.forEach(_value => {
                            _result.push(key + '[]=' + _value);
                        });
                }
            } else {
                _result.push(key + '=' + value);
            }
        }
        return _result.length ? prefix + _result.join('&') : '';
    }
};
$(function () {
    exportApp.main();
});
