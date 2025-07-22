import { saveSettingsDebounced, eventSource, event_types } from "../../../../script.js";

const CompletionNotifyPlugin = {
    STORAGE_KEY: "completion_notify_settings",

    state: {
        isEnabled: true,
        message: "对话已完成！",
    },

    initSettings() {
        const settings = localStorage.getItem(this.STORAGE_KEY);
        if (settings) {
            this.state = { ...this.state, ...JSON.parse(settings) };
        }
    },

    saveSettings() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
        saveSettingsDebounced();
    },

    createSettingsUI() {
        const container = $(`
          <div class="inline-drawer">
            <div class="inline-drawer-toggle inline-drawer-header">
              <b>对话完成提示</b>
              <div class="inline-drawer-icon fa-solid fa-circle-chevron-down down"></div>
            </div>
            <div class="inline-drawer-content">
              <div class="cn-setting-item">
                <label><input id="cn_enabled" type="checkbox" /><strong>启用插件</strong></label>
              </div>
              <div class="cn-setting-item">
                <label for="cn_message">提示消息：</label>
                <input type="text" id="cn_message" class="text_pole" />
              </div>
            </div>
          </div>
        `);

        $("#extensions_settings").append(container);

        // Init UI
        $("#cn_enabled").prop("checked", this.state.isEnabled);
        $("#cn_message").val(this.state.message);

        // Bind events
        $("#cn_enabled").on("change", (e) => {
            this.state.isEnabled = $(e.target).prop('checked');
            this.saveSettings();
        });
        $("#cn_message").on("input", (e) => {
            this.state.message = $(e.target).val();
            this.saveSettings();
        });
    },

    showCompletionNotification() {
        if (!this.state.isEnabled) return;

        const notify = $(`<div class="completion-notification">${this.state.message}</div>`);
        $("body").append(notify);

        setTimeout(() => notify.addClass("show"), 10);

        setTimeout(() => {
            notify.removeClass("show");
            setTimeout(() => notify.remove(), 500);
        }, 3000);
    },

    handleNewMessageEvent() {
        this.showCompletionNotification();
    },

    init() {
        this.initSettings();
        jQuery(async () => {
            this.createSettingsUI();
            eventSource.on(event_types.MESSAGE_RECEIVED, this.handleNewMessageEvent.bind(this));
        });
    }
};

CompletionNotifyPlugin.init();