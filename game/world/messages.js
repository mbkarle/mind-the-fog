/*
 * This file is for all message-related things including alerts,
 * prompts, etc
 */

function openAlert (message) {
  var cached_html = '<div id="ok" class="interact" style="z-index:6;">––&#62;</div>'
  $('#alertBox').show().append(message + '<br>')
  $('#ok').click(function () {
    $('#ok').off('click')
    $('#alertBox').hide().html(cached_html)
  })
}
