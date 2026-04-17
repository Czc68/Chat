package cn.xeblog.xechat.service;

import cn.xeblog.xechat.domain.dto.ChatRecordDTO;
import cn.xeblog.xechat.entity.ChatHistory;

import java.util.HashMap;
import java.util.List;

/**
 * 聊天记录
 *
 * @author yanpanyi
 * @date 2019/4/4
 */
public interface ChatRecordService {

    /**
     * 添加聊天记录
     *
     * @param chatRecordDTO 聊天记录对象
     */
    void addRecord(ChatRecordDTO chatRecordDTO);

    /**
     * 聊天记录列表
     *
     * @param directoryName 目录名
     * @return 聊天记录列表
     */
    List<HashMap<String, Object>> listRecord(String directoryName);
    /**
     * 从数据库获取最近的历史记录
     * @param limit 查询条数
     * @return 历史记录列表
     */
    List<ChatHistory> getDatabaseHistory(int limit);
}
