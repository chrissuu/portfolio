document.addEventListener("DOMContentLoaded", function () {
    var isLocalHost = ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
    var ritoLink = document.getElementById("rito-link");
    if (ritoLink && isLocalHost) {
        ritoLink.href = "/rito";
    }
});
