var msgTimer;
var utils = {
    // 秒倒数
    countdown: function(el, options) {
        var cfgs = $.extend({
            num: 0,
            strBefore: '',
            strAfter: '',
            callback: undefined
        }, options);

        var $el = $(el);
        var num = cfgs.num || parseInt($el.html());

        if (num > 0) {
            var strBefore = cfgs.strBefore;
            var strAfter = cfgs.strAfter;

            var timer = setInterval(function() {
                num--;

                if (num < 1) {
                    if (typeof cfgs.callback === 'function') {
                        cfgs.callback();
                    }

                    clearInterval(timer);
                    return;
                }

                if (strBefore) {
                    if (!strAfter) {
                        $el.html(strBefore + num);
                    } else {
                        $el.html(strBefore + num + strAfter);
                    }
                } else if (strAfter) {
                    $el.html(num + strAfter);
                } else {
                    $el.html(num);
                }
            }, 1000);
        }
    },

    // 常用的验证
    validator: function(val) {
        return {
            isPhoneNumber: /^1[3|5|7|8][0-9]\d{8}$/.test(val)
        };
    },

    // 页面提示
    showMsg: function(msg, ms) {
        var ms = ms || 3000;
        var $msg = $('.ui-message');

        if (!$msg.length) {
            $('body').append('<div class="ui-message" />');
            $msg = $('.ui-message');
        }

        $msg.hide().html(msg).fadeIn();
        if (msgTimer) clearTimeout(msgTimer);
        msgTimer = setTimeout(function() { $msg.fadeOut(); }, ms);
    },

    // 显示遮罩
    showMask: function(hideMask) {
        var $mask = $('.ui-mask');
        var $body = $('body');

        if (!$mask.length) {
            $('body').append('<div class="ui-mask" />');
            $mask = $('.ui-mask');
        }

        if (hideMask){
            $mask.fadeOut('fast');
            $body.attr('style', '');
        } else {
            $mask.hide().fadeIn('fast');
            $body.css({
                height: '100%',
                overflow: 'hidden'
            });
        }
    },

    // 启用按钮
    enableBtn: function(el) {
        $(el).removeClass('btn-disabled').prop('disabled', false);
    },

    // 禁用按钮
    disableBtn: function(el) {
        $(el).addClass('btn-disabled').prop('disabled', true);
    },

    // 获取剩余的数组元素
    getArrRest: function(arr, value, prop) {
        var rest = arr.slice();

        for (var i = 0; i < rest.length; i++) {
            if (prop && rest[i][prop] === value || !prop && rest[i] === value) {
                rest.splice(i, 1);
                break;
            }
        }

        return rest;
    },

    // 固定定位
    stickFooter: function(selector, container) {
        var $el = $(selector);
        var $container = container ? $(container) : $('body');
        var position = $el.css('position');

        function reposition() {
            var containerHeight = $container.outerHeight();
            var winHeight = $(window).height();

            $el.removeClass('fixed').css({
                position: position
            });

            if (containerHeight <= winHeight) {
                $el.addClass('fixed').css({
                    position: 'fixed'
                });
            }

            $el.show();
        }

        reposition();
        $(window).on('resize.sticky', reposition);
    },

    // 加载更多
    loadMore: function(el, options) {
        var cfgs = $.extend(true, {
            dropload: {
                scrollArea: window,
                domDown: {
                    domNoData : '<div class="dropload-noData">无更多数据</div>'
                }
            },
            page: 2, // 下一页数
            url: '', // 请求地址
            callback: undefined
        }, options);

        $(el).dropload($.extend({
            loadUpFn: function(me) {
                load(me, true);
            },
            loadDownFn: function(me) {
                load(me);
            },
        }, cfgs.dropload));

        function load(me, isUp) {
            $.ajax({
                url: cfgs.url,
                data: {
                    page: cfgs.page
                },
                dataType: cfgs.type || 'json',
                success: function(data) {
                    var tpl = typeof cfgs.callback === 'function' ? cfgs.callback(data) : '';

                    if (tpl) {
                        isUp ? $(el).prepend(tpl) : $(el).append(tpl, $('.dropload-down'));
                        me.resetload();
                        cfgs.page++;
                    } else {
                        me.noData();
                        me.lock();

                        if (isUp) {
                            $('.dropload-load').html('无更多数据').fadeOut(function() {
                                me.resetload();
                                me.unlock();
                            });
                        } else {
                            me.resetload();
                        }
                    }
                },
                error: function() {
                    me.resetload();
                }
            });
        }
    }
};

var Page = {
    init: function() {
        this.bind();
    },

    bind: function() {
        // 切换元素的显示
        $(document).on('click', '[data-collapse]', function(e) {
            var $toggle = $(this);
            var $target = $($toggle.attr('href'));
            var active = $toggle.is('.active');
            var animation = $toggle.data('animation');
            var mask = $toggle.data('mask');
            var hasMask = typeof mask !== 'undefined';

            if (active) {
                animation ? $target.removeClass(animation) : $target.addClass('hide');
                hasMask && utils.showMask(true);
            } else {
                animation ? $target.addClass(animation) : $target.removeClass('hide');
                hasMask && utils.showMask();
            }

            $toggle.toggleClass('active');
            e.preventDefault();
        });

        // 遮罩事件
        $(document).on('click', '.ui-mask', function(e) {
            var $type = $('.top-nav-type');
            var typeActive = $type.is('.active');
            typeActive && $type.trigger('click');
        });

        // 分享
        $('.share-btn').on('click', function(e) {
            var $mask = $('.share-mask');
            var $container = $('.page-container');
            var $body = $('body');

            $mask.hide().fadeIn('fast');
            $container.addClass('blur');
            $body.css({
                height: '100%',
                overflow: 'hidden'
            });
        });

        $('.share-mask').on('click', function(e) {
            var $mask = $(this);
            var $container = $('.page-container');
            var $body = $('body');

            $mask.fadeOut('fast');
            $container.removeClass('blur');
            $body.attr('style', '');
        });
    }
};

$(function() {
    Page.init();
});
