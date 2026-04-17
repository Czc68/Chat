package cn.xeblog.xechat.controller;

import cn.xeblog.xechat.domain.vo.ResponseVO;
import cn.xeblog.xechat.service.ChatRecordService;
import com.alibaba.fastjson2.JSONObject;
import org.springframework.web.bind.annotation.*;
import jakarta.annotation.Resource;

@RestController
@RequestMapping("/api/record")
public class ChatRecordController {

    @Resource
    private ChatRecordService chatRecordService;

    @GetMapping
    public ResponseVO listChatRecord(@RequestParam(required = false, defaultValue = "") String directoryName) {
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("list", chatRecordService.listRecord(directoryName));
        return new ResponseVO(jsonObject);
    }
}