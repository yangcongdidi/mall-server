const ejs =require('ejs')

const tpl = `
<xml>

  

    <ToUserName><%= toUserName %></ToUserName>
    <FromUserName><%= fromUserName %></FromUserName>
    <CreateTime><%= createTime %></CreateTime>
    <MsgType><%= msgType %></MsgType>
    <% if (msgType ==='text') { %>
    <Content><%= content %></Content>
    <%} else if (msgType ==='image') { %>
    <PicUrl>< ![CDATA[this is a url] ]></PicUrl>
    <MediaId>< ![CDATA[<% content.mediaId %>] ]></MediaId>
    <%} else if (msgType ==='voice') { %>
    <MediaId>< ![CDATA[<% content.mediaId %>] ]></MediaId>
    <%} else if (msgType ==='video') { %>
    <MediaId>< ![CDATA[<% content.mediaId %>] ]></MediaId><ThumbMediaId>< ![CDATA[thumb_media_id] ]></ThumbMediaId>
    <% } %>
</xml>

`


const compiled =ejs.compile(tpl);
module.exports = compiled



