$.validator.addMethod("mobileZH", function(phone_number, element) {
    try {
        if (element.inputmask) {
            phone_number = element.inputmask.unmaskedvalue();
        }
    } catch (e) {
    }
    var length = phone_number.length;
    var mobile = /^(13[0-9]{9})|(18[0-9]{9})|(14[0-9]{9})|(17[0-9]{9})|(15[0-9]{9})$/;
    return this.optional(element) || (length === 11 && mobile.test(phone_number));
}, "请填写正确的手机号码");

$.extend( $.validator.messages, {
    ipv4: "请填写正确的IPv4地址",
});