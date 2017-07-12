;
(function($, window, document, undefined) {
    $.fn.cutImage = function(opt) {
        if (this.attr('type') !== 'file') {
            console.log('绑定的dom不是文件上传控件');
            return false;
        }
        var that = this;
        that.defaults = {
            minedge: 720,
            aspectRatio: 3 / 4,
            blob: false,
            mode: 'cut'
        };
        that.options = $.extend({}, that.defaults, opt);
        that.on('change', function(e) {
            var $file = $(this);
            var $layer, $img;
            var reader = new FileReader();
            reader.onload = function(e) {
                if (that.options.mode === 'cut') {
                    $('body').append('<div class="cropper-layer"><div class="cropper-pop"><img class="image-container" style="opacity:0"><div class="right-box"><div class="img-preview"></div><button id="pic" class="btn-cut btn-hover">确认裁剪</button><div class="rotate-box"><button title="逆时针旋转90°" data-state="left" class="btn-rotate btn-hover btn-left"></button><button title="顺时针旋转90°" data-state="right" class="btn-rotate btn-hover"></button></div></div></div><div class="mask-layer"></div></div>');
                    $layer = $('body').find('.cropper-layer');
                    $img = $layer.find('.image-container');
                    $img[0].src = this.result;
                    $img.on('load', function() {
                        var $this = $(this);
                        $this.cropper({
                            aspectRatio: that.options.aspectRatio,
                            viewMode: 1,
                            preview: '.img-preview',
                            ready: function() {
                                $('#pic').addClass('mask-in');
                                $layer.on('click', '.btn-rotate', function() {
                                    var state = $(this).data('state');
                                    if (state === 'left') {
                                        $img.cropper('rotate', -90);
                                    } else {
                                        $img.cropper('rotate', 90);
                                    }
                                })
                                $layer.on('click', '#pic', function() {
                                    minPic($img.cropper('getCroppedCanvas').toDataURL('image/jpeg'), that.options.minedge);
                                    $layer.addClass('mask-out');
                                });
                            }
                        });
                    })
                } else if (that.options.mode === 'compress') {
                    minPic(this.result, that.options.minedge);
                }

                function backData(dataurl) {
                    if (that.options.blob) {
                        dataurl = dataURItoBlob(dataurl);
                    }
                    if (that.options.cutFun) {
                        that.options.cutFun(dataurl);
                        if ($layer) {
                            setTimeout(function() {
                                $layer.remove();
                            }, 300);
                        }
                    } else {
                        console.log('请设置截图按钮回调');
                    }
                }

                function minPic(dataurl, minedge) {
                    var c = document.createElement('canvas');
                    var cxt = c.getContext("2d");
                    var img = new Image();
                    img.src = dataurl;
                    img.onload = function() {
                        var width = this.width;
                        var height = this.height;
                        var min, edge, scale;
                        var drawW, drawH;
                        if (width === height || width < height) {
                            min = width;
                            edge = 'width';
                        } else if (width > height) {
                            min = height;
                            edge = 'height';
                        }

                        if (min < minedge || minedge === 'auto') {
                            drawW = width;
                            drawH = height;
                        } else {
                            if (edge === 'width') {
                                scale = width / height;
                                drawW = minedge;
                                drawH = minedge / scale;
                            } else {
                                scale = height / width;
                                drawH = minedge;
                                drawW = minedge / scale;
                            }
                        }
                        c.width = drawW;
                        c.height = drawH;
                        cxt.clearRect(0, 0, drawW, drawH);
                        cxt.drawImage(img, 0, 0, drawW, drawH);
                        backData(c.toDataURL('image/jpeg', 0.9))
                    };
                }
            };
            reader.readAsDataURL(e.target.files[0]);
        })

        function dataURItoBlob(base64Data) {
            var byteString;
            if (base64Data.split(',')[0].indexOf('base64') >= 0)
                byteString = atob(base64Data.split(',')[1]);
            else
                byteString = unescape(base64Data.split(',')[1]);
            var mimeString = base64Data.split(',')[0].split(':')[1].split(';')[0];
            var ia = new Uint8Array(byteString.length);
            for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
            }
            return new Blob([ia], { type: mimeString });
        }
    }

})(jQuery, window, document);