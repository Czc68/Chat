package cn.xeblog.xechat.service.impl;

import cn.xeblog.xechat.constant.DateConstant;
import cn.xeblog.xechat.domain.dto.ChatRecordDTO;
import cn.xeblog.xechat.domain.mo.User;
import cn.xeblog.xechat.entity.ChatHistory;
import cn.xeblog.xechat.enums.MessageTypeEnum;
import cn.xeblog.xechat.mapper.ChatHistoryMapper;
import cn.xeblog.xechat.service.ChatRecordService;
import cn.xeblog.xechat.utils.DateUtils;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringEscapeUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.annotation.Resource;
import java.io.*;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
public class ChatRecordServiceImpl implements ChatRecordService {

    @Resource
    private ChatHistoryMapper chatHistoryMapper;

    @Value("${chatrecord.path}")
    private String path;

    @Value("${chatrecord.accessAddress}")
    private String accessAddress;

    private static final String FILE_SUFFIX = ".md";

    @Async
    @Override
    public void addRecord(ChatRecordDTO chatRecordDTO) {
        if (null == chatRecordDTO || chatRecordDTO.getUser() == null) return;

        // 1. 核心：存入数据库 chat_history 表
        if (chatRecordDTO.getType() == MessageTypeEnum.USER || chatRecordDTO.getType() == MessageTypeEnum.ROBOT) {
            try {
                String rawUserId = chatRecordDTO.getUser().getUserId();
                // 只有登录用户的 ID（纯数字）才存入数据库，UUID游客仅存文件
                if (StringUtils.isNumeric(rawUserId)) {
                    ChatHistory history = new ChatHistory();
                    history.setUserId(Long.parseLong(rawUserId)); // 对应数据库的 user_id
                    history.setContent(chatRecordDTO.getMessage()); // 消息内容
                    history.setCreateTime(LocalDateTime.now());
                    chatHistoryMapper.insert(history);
                    log.info("消息已成功存入数据库，用户ID: {}", rawUserId);
                }
            } catch (Exception e) {
                log.error("数据库存储聊天记录失败", e);
            }
        }

        // 2. 原有的文件备份逻辑（保留作为双重保险）
        saveToFile(chatRecordDTO);
    }

    private void saveToFile(ChatRecordDTO chatRecordDTO) {
        File file = new File(createFileName());
        if (!file.getParentFile().exists()) {
            file.getParentFile().mkdirs();
        }
        try (BufferedWriter out = new BufferedWriter(new OutputStreamWriter(new FileOutputStream(file, true), "UTF-8"))) {
            out.write(formatContent(chatRecordDTO));
        } catch (IOException e) {
            log.error("添加文件记录异常", e);
        }
    }

    private String createFileName() {
        Calendar calendar = Calendar.getInstance();
        StringBuffer sb = new StringBuffer();
        sb.append(path);
        sb.append(calendar.get(Calendar.YEAR));
        sb.append(File.separator);
        sb.append(calendar.get(Calendar.MONTH) + 1);
        sb.append(File.separator);
        sb.append(DateUtils.getDate(calendar.getTime(), DateConstant.CHAT_RECORD_FILE_NAME));
        sb.append(FILE_SUFFIX);
        return sb.toString();
    }

    private String formatContent(ChatRecordDTO chatRecordDTO) {
        if (null == chatRecordDTO) return "";
        StringBuffer sb = new StringBuffer();
        User user = chatRecordDTO.getUser();
        switch (chatRecordDTO.getType()) {
            case ROBOT:
            case USER:
                formatUserMsg(sb, chatRecordDTO);
                break;
            case SYSTEM:
                formatSystemMsg(sb, chatRecordDTO);
                break;
            case REVOKE:
                chatRecordDTO.setMessage(user.getUsername() + "撤回了一条消息！");
                formatSystemMsg(sb, chatRecordDTO);
                break;
            default:
                break;
        }
        return sb.toString();
    }

    @Override
    public List<HashMap<String, Object>> listRecord(String directoryName) {
        File file = new File(path + directoryName);
        if (!file.exists()) return null;
        String[] tempList = file.list();
        if (tempList == null || tempList.length < 1) return null;
        List<HashMap<String, Object>> list = new ArrayList<>(tempList.length);
        String url = null;
        for (String name : tempList) {
            HashMap<String, Object> map = new HashMap<>(3, 1.0f);
            boolean isFile = name.lastIndexOf(FILE_SUFFIX) != -1;
            if (isFile) url = accessAddress + directoryName + name;
            map.put("name", name);
            map.put("url", url);
            map.put("file", isFile);
            list.add(map);
        }
        return list;
    }

    private void formatSystemMsg(StringBuffer sb, ChatRecordDTO chatRecordDTO) {
        sb.append("#### [").append(chatRecordDTO.getSendTime()).append("] 系统消息：\r\n> ")
                .append(chatRecordDTO.getMessage()).append("\r\n");
    }

    private void formatUserMsg(StringBuffer sb, ChatRecordDTO chatRecordDTO) {
        User user = chatRecordDTO.getUser();
        String tag = chatRecordDTO.getType() == MessageTypeEnum.ROBOT ? "[系统机器人] " : "";
        sb.append("#### [").append(chatRecordDTO.getSendTime()).append("] ")
                .append(tag).append(user.getUsername()).append("(").append(user.getAddress()).append(")：\r\n");
        if (!StringUtils.isEmpty(chatRecordDTO.getImage())) {
            sb.append("> ![](").append(chatRecordDTO.getImage()).append(")\r\n");
        }
        if (!StringUtils.isEmpty(chatRecordDTO.getMessage())) {
            sb.append("> ").append(StringEscapeUtils.escapeHtml4(chatRecordDTO.getMessage())).append("\r\n");
        }
    }

    @Override
    public List<ChatHistory> getDatabaseHistory(int limit) {
        QueryWrapper<ChatHistory> wrapper = new QueryWrapper<>();
        wrapper.orderByDesc("create_time").last("limit " + limit);
        List<ChatHistory> list = chatHistoryMapper.selectList(wrapper);
        Collections.reverse(list);
        return list;
    }
}