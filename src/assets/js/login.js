jQuery(function ($) {
    refreshVerifyCode();
    initEventListener();
    $loginSubmit = $("#loginSubmit");
});
//登录提交
function loginSubmit() {
    if($loginSubmit.hasClass("disabled")) return false;
    var obj = {
        username: $.trim($('#account').val()),
        password: $.trim($('#password').val())
    };
    $.ajax({
        type : "POST",
        url : "/login",
        data : JSON.stringify(obj),
        contentType : "application/json",
        dataType : "json",
        success: function(ret) {
            if (ret.code === 200) {
                ace.data.set("token", ret.data.token);
                ace.data.set("user", JSON.stringify(ret.data.userInfo));
                setTimeout(function() {
                    location.replace("index.html");
                }, 1000);
            } else {
                /*layer.closeAll('loading');*/
                layer.msg(ret.message,{icon: 2});
            }
        }
    })
        .error(function(XMLHttpRequest, textStatus, errorThrown) {
            if(textStatus === "timeout") {
                layer.msg("请求超时!", {icon: 5});
            } else {
                var responseJson = XMLHttpRequest.responseJSON;
                if(responseJson && responseJson.message) {
                    layer.msg(responseJson.message, {icon: 5});
                    return;
                }
                var status = XMLHttpRequest.status;
                if(status == '504'){
                    layer.msg("请求超时!", {icon: 5});
                } else {
                    layer.msg("请求出错了！", {icon: 5});
                }
            }
        })
    ;
}

//初始化页面中的DOM监听
function initEventListener() {
    $(document).ready(function(){
        $('#loginForm input:first').focus().lazy(checkHasVal);
    })
    .on("keyup change", "input", function(e){
        $(this).lazy(checkHasVal);
    })
    .on("click", "#loginSubmit", loginSubmit)
    .on("click", "#randCodeImage", refreshVerifyCode)
    ;
}


//刷新验证码
function refreshVerifyCode(){
    $("#randCodeImage").attr("src","randCodeImage?&_t="+(new Date).getTime());
}

function checkHasVal() {
    var canSubmit = true;
    $('#loginForm input:required')
        .each(function(index, element){
            if($(element).val().trim().length <= 0) {
                canSubmit  = false;
                return false;
            }
        });
    canSubmit && $loginSubmit.enable() || $loginSubmit.disable();
}

function checkValid(e) {
    var u = $(this)
        , msg = u.data("validationMessage")
        , memo = u.data("memo")
        , pattern = u.attr("pattern")
        , regex = new RegExp(pattern)
        , val = u.val().trim()
        , match = regex.test(val);
    return "" == val ? (e || (u.error(), alert(memo+"不能为空"), false))
        : (match ? (u.ok(), true) : (u.error(), alert(msg || "请按规则填写字段"), false));
}

$.fn.lazy = function(e) {
    var t = $(this);
    clearTimeout(t.data("ticker")),
        t.data("ticker", setTimeout(function() {
                e.call(t);
            }
            , 100));
},
$.fn.ok = function() {
    return $(this).removeClass("field-error"),
        $(this)
}
,
$.fn.error = function() {
    return $(this).select().addClass("field-error"),
        $(this);
}
,
$.fn.enable = function() {
    return $(this).removeClass("disabled"),
        $(this);
}
,
$.fn.disable = function() {
    return $(this).addClass("disabled"),
        $(this);
};
