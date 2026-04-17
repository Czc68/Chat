package cn.xeblog.xechat.controller;

import cn.xeblog.xechat.domain.vo.ResponseVO;
import cn.xeblog.xechat.service.ChatRecordService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatHistoryController {

    @Resource
    private ChatRecordService chatRecordService;

    @GetMapping("/history")
    public ResponseVO getHistory(@RequestParam(defaultValue = "20") int limit) {
        // 调用你在 ChatRecordServiceImpl 中实现的 getDatabaseHistory 方法
        return new ResponseVO(chatRecordService.getDatabaseHistory(limit));
    }
}