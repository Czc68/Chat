package cn.xeblog.xechat.domain.vo;

import cn.xeblog.xechat.enums.CodeEnum;
import cn.xeblog.xechat.enums.inter.Code;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;

/**
 * 响应数据结构
 *
 * @author yanpanyi
 * @date 2019/3/20
 */
@Getter
@Setter
@ToString
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ResponseVO implements Serializable {

    private static final long serialVersionUID = -5327212050370584991L;
    private static final CodeEnum SUCCESS = CodeEnum.SUCCESS;

    /**
     * 响应码
     */
    private Integer code;
    /**
     * 响应数据
     */
    private Object data;
    /**
     * 响应描述
     */
    private String desc;

    /**
     * 成功响应且带响应数据
     *
     * @param data 响应数据
     */
    public ResponseVO(Object data) {
        this.code = SUCCESS.getCode();
        this.desc = SUCCESS.getDesc();
        this.data = data;
    }

    /**
     * 只带响应code和desc
     *
     * @param code 响应code
     */
    public ResponseVO(Code code) {
        this.code = code.getCode();
        this.desc = code.getDesc();
    }

    // ==========================================
    // 下面是你需要补充的静态辅助方法
    // ==========================================

    /**
     * 响应成功 (无数据)
     */
    public static ResponseVO success() {
        return new ResponseVO(SUCCESS);
    }

    /**
     * 响应成功 (带数据)
     */
    public static ResponseVO success(Object data) {
        return new ResponseVO(data);
    }

    /**
     * 响应失败 (自定义错误提示)
     */
    public static ResponseVO error(String desc) {
        // 默认使用 FAILED (503) 状态码，并覆盖为自定义的错误信息
        ResponseVO responseVO = new ResponseVO(CodeEnum.FAILED);
        responseVO.setDesc(desc);
        return responseVO;
    }

}
