const translations = {
    'en': {
        // Navigation
        'nav_dashboard': 'Dashboard',
        'nav_statistics': 'Statistics',
        'nav_sleep_pattern': 'Sleep Pattern',
        'nav_body_data': 'Body Data',
        'nav_settings': 'Settings',
        
        // Date Navigation
        'previous_day': 'Previous Day',
        'next_day': 'Next Day',
        'today': 'Today',
        
        // Care Records
        'care_records': 'Care Records',
        'add_record': 'Add New Record',
        'delete_selected': 'Delete Selected',
        'time': 'Time',
        'care_type': 'Care Type',
        'details': 'Details',
        'notes': 'Notes',
        'date': 'Date',
        
        // Care Types
        'formula': 'Formula Feeding',
        'breastfeeding': 'Breastfeeding',
        'diaper': 'Diaper Change',
        'select_care_type': 'Select care type',
        'breast_milk_bottle': 'Breast Milk Bottle',
        'breast_milk_bottle_feeding': 'Breast Milk Bottle Feeding',
        
        // Form Fields
        'volume': 'Volume (ml)',
        'duration': 'Duration (minutes)',
        'diaper_type': 'Diaper Type',
        'date_and_time': 'Date and Time',
        'pee': 'Pee',
        'poo': 'Poo',
        'both': 'Both',
        'add_record_btn': 'Add Record',
        'minutes': 'min',
        'ml': 'ml',
        
        // Theme
        'dark_mode': 'Dark mode',
        'light_mode': 'Light mode',
        
        // Settings
        'language': 'Language',
        'theme': 'Theme',
        'timezone': 'Timezone',
        
        // Messages
        'record_added': 'Record added successfully',
        'record_deleted': 'Record deleted successfully',
        'error_occurred': 'An error occurred',
        'no_records': 'No records found for this date',
        'loading': 'Loading...',
        'future_date': 'Cannot select future dates',
        'no_records_found_for_this_date': 'No records found for this date',
        
        // Settings
        'settings_title': 'Settings',
        
        // Languages
        'english': 'English',
        'chinese': 'Simplified Chinese',
        
        // Other UI elements
        'toggle_theme': 'Toggle theme',
        'baby_care': 'Baby Care',
        'volume_ml': 'Volume (ml)',
        'duration_min': 'Duration (minutes)',
        'monday': 'Monday',
        'tuesday': 'Tuesday',
        'wednesday': 'Wednesday',
        'thursday': 'Thursday',
        'friday': 'Friday',
        'saturday': 'Saturday',
        'sunday': 'Sunday',
        'january': 'January',
        'february': 'February',
        'march': 'March',
        'april': 'April',
        'may': 'May',
        'june': 'June',
        'july': 'July',
        'august': 'August',
        'september': 'September',
        'october': 'October',
        'november': 'November',
        'december': 'December',
        'year': 'Year',
        'month': 'Month',
        'day': 'Day',
        
        // Notifications and Messages
        'record_added_successfully': 'Record added successfully',
        'records_deleted_successfully': 'Records deleted successfully',
        'failed_to_add_record': 'Failed to add record',
        'failed_to_delete_records': 'Failed to delete records',
        'no_records_selected': 'No records selected',
        'are_you_sure_you_want_to_delete_selected_records': 'Are you sure you want to delete selected records?',
        'server_connection_error': 'Server connection error',
        'an_error_occurred': 'An error occurred',
        'cannot_select_future_dates': 'Cannot select future dates',
        'failed_to_change_date': 'Failed to change date',
        'switched_to': 'Switched to',
        'mode': 'mode',
        'language_changed': 'Language changed',
        
        // Weekdays (lowercase for date formatting)
        'monday': 'Monday',
        'tuesday': 'Tuesday',
        'wednesday': 'Wednesday',
        'thursday': 'Thursday',
        'friday': 'Friday',
        'saturday': 'Saturday',
        'sunday': 'Sunday',
        
        // Statistics
        'start_date': 'Start Date',
        'end_date': 'End Date',
        'update': 'Update',
        'total_feedings': 'Total Feedings',
        'latest_daily_volume': 'Latest Daily Volume (ml)',
        'total_diapers': 'Total Diapers',
        'avg_feedings_per_day': 'Avg Feedings/Day',
        'feeding_patterns': 'Feeding Patterns',
        'daily_volumes': 'Daily Volumes',
        'diaper_changes': 'Diaper Changes',
        'diaper_changes_pee': 'Diaper Changes - Pee',
        'diaper_changes_poo': 'Diaper Changes - Poo',
        'care_distribution': 'Care Distribution',
        'feedings': 'Feedings',
        'error_updating_statistics': 'Error updating statistics',
        'statistics_updated': 'Statistics updated successfully',
        'failed_to_fetch_statistics': 'Failed to fetch statistics',
        'please_select_date_range': 'Please select a date range',
        'theme_changed': 'Theme changed',
        
        // Sleep-related
        'sleep': 'Sleep',
        'sleep_duration': 'Sleep Duration',
        'hours': 'hours',
        'minutes': 'minutes',
        'please_enter_valid_sleep_duration': 'Please enter a valid sleep duration',
        'hours_must_be_between_0_and_24': 'Hours must be between 0 and 24',
        'minutes_must_be_between_0_and_59': 'Minutes must be between 0 and 59',
        
        // Sleep Pattern
        'sleep_pattern': 'Sleep Pattern',
        'pattern': 'Pattern',
        'select_week': 'Select Week',
        'this_week': 'This Week',
        'previous_week': 'Previous Week',
        'next_week': 'Next Week',
        'week_of': 'Week of',
        'no_sleep_data': 'No sleep data available for this week',
        'hours_slept': 'Hours Slept',
        'day': 'Day',
        'mon': 'Mon',
        'tue': 'Tue',
        'wed': 'Wed',
        'thu': 'Thu',
        'fri': 'Fri',
        'sat': 'Sat',
        'sun': 'Sun',
        'error_navigating_week': 'Error navigating week',
        'failed_to_load_sleep_data': 'Failed to load sleep data',
        'record': 'record',
        'records': 'records',
        'weekly_summary': 'Weekly Summary',
        'avg_sleep_time': 'Average Sleep Time',
        'total_sleep_records': 'Total Sleep Records',
        'total_sleep_time': 'Total Sleep Time',
        'retry': 'Retry',
        'hour': 'hour',
        'session': 'session',
        'sessions': 'sessions',
        'failed_to_update_chart': 'Failed to update chart',
        'chart_container_not_found': 'Chart container not found',
        'failed_to_get_canvas_context': 'Failed to get canvas context',
        'no_sleep_data_available': 'No sleep data available',
        'click_for_details': 'Click on a sleep block for details',
        'short_sleep': 'Short nap (<30min)',
        'medium_sleep': 'Medium nap (30min-2h)',
        'long_sleep': 'Long sleep (>2h)',
        'continues_next_day': 'Continues to next day',
        'continued_from_prev_day': 'Continued from previous day',

        // Body Data Page
        'nav_body_data': 'Body Data',
        'body_data_title': 'Body Data',
        'body_data_description': 'Track your baby\'s weight and height data to observe growth curves.',
        'growth_curves': 'Growth Curves',
        'weight_curve': 'Weight Curve',
        'height_curve': 'Height Curve',
        'data_record': 'Data Record',
        'record_date': 'Record Date',
        'weight_kg': 'Weight (kg)',
        'height_cm': 'Height (cm)',
        'save_data': 'Save Data',
        'update_data': 'Update Data',
        'cancel_record': 'Cancel Record',
        'cancel_reason': 'Cancellation Reason',
        'confirm_signature': 'Confirm Signature',
        'clear_signature': 'Clear Signature',
        'submit_cancellation': 'Submit Cancellation Request',
        'one_month': '1 Month',
        'three_months': '3 Months',
        'six_months': '6 Months',
        'one_year': '1 Year',
        'all_data': 'All',
        'edit': 'Edit',
        'delete': 'Delete',
        'weight': 'Weight',
        'height': 'Height',
        'actions': 'Actions',
        'data_saved': 'Data saved successfully',
        'data_deleted': 'Data deleted successfully',
        'error_saving_data': 'Error saving data',
        'error_deleting_data': 'Error deleting data',
        'cancellation_submitted': 'Cancellation request submitted',
        'please_fill_all_required_fields': 'Please fill all required fields',
        'please_fill_date_and_at_least_one_measurement': 'Please fill in the date and at least one measurement (weight or height)',
        'please_provide_reason': 'Please provide a reason',
        'please_confirm_with_signature': 'Please confirm with signature',
        'confirm_delete': 'Are you sure you want to delete this record?',
        'no_data': 'No data',
        'percentile_3': '3rd Percentile',
        'percentile_50': '50th Percentile',
        'percentile_97': '97th Percentile',
        'reference_curves': 'Reference Curves:',
        'male': 'Boy',
        'female': 'Girl',
        'cdc_growth_note': 'The growth curves above are based on the CDC (Centers for Disease Control and Prevention) standard growth charts. The reference curves show the 3rd, 50th, and 97th percentiles for weight and height at different ages.',
        'who_growth_note': 'The growth curves above are based on the WHO (World Health Organization) standard growth charts. The reference curves show the 3rd, 15th, 50th, 85th, and 97th percentiles for weight and height at different ages.',
        'percentile_15': '15th Percentile',
        'percentile_85': '85th Percentile',
        'age_months': 'Age (months)',
        'birth_to_2_years': 'Birth to 2 years (percentiles)',
        'weight_for_age_boys': 'Weight-for-age BOYS',
        'height_for_age_boys': 'Length/Height-for-age BOYS',
        'weight_for_age_girls': 'Weight-for-age GIRLS',
        'height_for_age_girls': 'Length/Height-for-age GIRLS',
    },
    'zh-CN': {
        // Navigation
        'nav_dashboard': '仪表盘',
        'nav_statistics': '统计数据',
        'nav_sleep_pattern': '睡眠模式',
        'nav_body_data': '身体数据',
        'nav_settings': '设置',
        
        // Date Navigation
        'previous_day': '前一天',
        'next_day': '后一天',
        'today': '今天',
        
        // Care Records
        'care_records': '护理记录',
        'add_record': '添加新记录',
        'delete_selected': '删除所选',
        'time': '时间',
        'care_type': '护理类型',
        'details': '详情',
        'notes': '备注',
        'date': '日期',
        
        // Care Types
        'formula': '配方奶',
        'breastfeeding': '母乳喂养',
        'diaper': '换尿布',
        'select_care_type': '选择护理类型',
        'breast_milk_bottle': '母乳瓶喂',
        'breast_milk_bottle_feeding': '母乳瓶喂',
        
        // Form Fields
        'volume': '容量 (ml)',
        'duration': '时长 (分钟)',
        'diaper_type': '尿布类型',
        'date_and_time': '日期和时间',
        'pee': '小便',
        'poo': '大便',
        'both': '都有',
        'add_record_btn': '添加记录',
        'minutes': '分钟',
        'ml': '毫升',
        
        // Theme
        'dark_mode': '深色模式',
        'light_mode': '浅色模式',
        
        // Settings
        'language': '语言',
        'theme': '主题',
        'timezone': '时区',
        
        // Messages
        'record_added': '记录添加成功',
        'record_deleted': '记录删除成功',
        'error_occurred': '发生错误',
        'no_records': '该日期没有记录',
        'loading': '加载中...',
        'future_date': '不能选择未来日期',
        'no_records_found_for_this_date': '该日期没有记录',
        
        // Settings
        'settings_title': '设置',
        
        // Languages
        'english': '英语',
        'chinese': '简体中文',
        
        // Other UI elements
        'toggle_theme': '切换主题',
        'baby_care': '婴儿护理',
        'volume_ml': '容量 (毫升)',
        'duration_min': '时长 (分钟)',
        'monday': '星期一',
        'tuesday': '星期二',
        'wednesday': '星期三',
        'thursday': '星期四',
        'friday': '星期五',
        'saturday': '星期六',
        'sunday': '星期日',
        'january': '一月',
        'february': '二月',
        'march': '三月',
        'april': '四月',
        'may': '五月',
        'june': '六月',
        'july': '七月',
        'august': '八月',
        'september': '九月',
        'october': '十月',
        'november': '十一月',
        'december': '十二月',
        'year': '年',
        'month': '月',
        'day': '日',
        
        // Notifications and Messages
        'record_added_successfully': '记录添加成功',
        'records_deleted_successfully': '记录删除成功',
        'failed_to_add_record': '添加记录失败',
        'failed_to_delete_records': '删除记录失败',
        'no_records_selected': '未选择任何记录',
        'are_you_sure_you_want_to_delete_selected_records': '确定要删除所选记录吗？',
        'server_connection_error': '服务器连接错误',
        'an_error_occurred': '发生错误',
        'cannot_select_future_dates': '不能选择未来日期',
        'failed_to_change_date': '更改日期失败',
        'switched_to': '已切换至',
        'mode': '模式',
        'language_changed': '语言已更改',
        
        // Weekdays (lowercase for date formatting)
        'monday': '星期一',
        'tuesday': '星期二',
        'wednesday': '星期三',
        'thursday': '星期四',
        'friday': '星期五',
        'saturday': '星期六',
        'sunday': '星期日',
        
        // Statistics
        'start_date': '开始日期',
        'end_date': '结束日期',
        'update': '更新',
        'total_feedings': '总喂养次数',
        'latest_daily_volume': '最新日喂养量 (毫升)',
        'total_diapers': '总尿布更换',
        'avg_feedings_per_day': '日均喂养次数',
        'feeding_patterns': '喂养模式',
        'daily_volumes': '每日容量',
        'diaper_changes': '尿布更换',
        'diaper_changes_pee': '尿布更换 - 小便',
        'diaper_changes_poo': '尿布更换 - 大便',
        'care_distribution': '护理分布',
        'feedings': '喂养',
        'error_updating_statistics': '更新统计数据时出错',
        'statistics_updated': '统计数据已更新',
        'failed_to_fetch_statistics': '获取统计数据失败',
        'please_select_date_range': '请选择日期范围',
        'theme_changed': '主题已更改',
        
        // Sleep-related
        'sleep': '睡觉',
        'sleep_duration': '睡眠时长',
        'hours': '小时',
        'minutes': '分钟',
        'please_enter_valid_sleep_duration': '请输入有效的睡眠时长',
        'hours_must_be_between_0_and_24': '小时必须在0至24之间',
        'minutes_must_be_between_0_and_59': '分钟必须在0至59之间',
        
        // Sleep Pattern
        'sleep_pattern': '睡眠模式',
        'pattern': '模式',
        'select_week': '选择周',
        'this_week': '本周',
        'previous_week': '上一周',
        'next_week': '下一周',
        'week_of': '周开始于',
        'no_sleep_data': '本周没有睡眠数据',
        'hours_slept': '睡眠小时数',
        'day': '日',
        'mon': '周一',
        'tue': '周二',
        'wed': '周三',
        'thu': '周四',
        'fri': '周五',
        'sat': '周六',
        'sun': '周日',
        'error_navigating_week': '导航周时出错',
        'failed_to_load_sleep_data': '加载睡眠数据失败',
        'record': '条记录',
        'records': '条记录',
        'weekly_summary': '每周总结',
        'avg_sleep_time': '平均睡眠时间',
        'total_sleep_records': '睡眠记录总数',
        'total_sleep_time': '总睡眠时间',
        'retry': '重试',
        'hour': '小时',
        'session': '次',
        'sessions': '次',
        'failed_to_update_chart': '更新图表失败',
        'chart_container_not_found': '未找到图表容器',
        'failed_to_get_canvas_context': '无法获取画布上下文',
        'no_sleep_data_available': '没有可用的睡眠数据',
        'click_for_details': '点击睡眠块查看详情',
        'short_sleep': '短睡眠 (<30分钟)',
        'medium_sleep': '中等睡眠 (30分钟-2小时)',
        'long_sleep': '长时间睡眠 (>2小时)',
        'continues_next_day': '延续至次日',
        'continued_from_prev_day': '从前一天继续',

        // Body Data Page
        'nav_body_data': '身体数据',
        'body_data_title': '身体数据',
        'body_data_description': '记录和跟踪婴儿的体重和身高数据，观察生长发育曲线。',
        'growth_curves': '生长曲线',
        'weight_curve': '体重曲线',
        'height_curve': '身高曲线',
        'data_record': '数据记录',
        'record_date': '记录日期',
        'weight_kg': '体重 (kg)',
        'height_cm': '身高 (cm)',
        'save_data': '保存数据',
        'update_data': '更新数据',
        'cancel_record': '取消记录',
        'cancel_reason': '取消原因',
        'confirm_signature': '确认签名',
        'clear_signature': '清除签名',
        'submit_cancellation': '提交取消请求',
        'one_month': '1个月',
        'three_months': '3个月',
        'six_months': '6个月',
        'one_year': '1年',
        'all_data': '全部',
        'edit': '编辑',
        'delete': '删除',
        'weight': '体重',
        'height': '身高',
        'actions': '操作',
        'data_saved': '数据保存成功',
        'data_deleted': '数据删除成功',
        'error_saving_data': '保存数据时出错',
        'error_deleting_data': '删除数据时出错',
        'cancellation_submitted': '取消请求已提交',
        'please_fill_all_required_fields': '请填写所有必填字段',
        'please_fill_date_and_at_least_one_measurement': '请填写日期并至少填写一个测量值（体重或身高）',
        'please_provide_reason': '请提供原因',
        'please_confirm_with_signature': '请确认签名',
        'confirm_delete': '确定要删除这条记录吗？',
        'no_data': '无数据',
        'percentile_3': '第3百分位',
        'percentile_50': '第50百分位',
        'percentile_97': '第97百分位',
        'reference_curves': '参考曲线：',
        'male': '男孩',
        'female': '女孩',
        'cdc_growth_note': '以上生长曲线基于美国疾病控制与预防中心 (CDC) 标准生长曲线数据。参考曲线显示了婴幼儿在不同年龄段的第3、第50和第97百分位体重和身高数据。',
        'who_growth_note': '以上生长曲线基于世界卫生组织 (WHO) 标准生长曲线数据。参考曲线显示了婴幼儿在不同年龄段的第3、第15、第50、第85和第97百分位体重和身高数据。',
        'percentile_15': '第15百分位',
        'percentile_85': '第85百分位',
        'age_months': '年龄（月）',
        'birth_to_2_years': '出生至2岁（百分位）',
        'weight_for_age_boys': '男孩体重-年龄对照表',
        'height_for_age_boys': '男孩身长/身高-年龄对照表',
        'weight_for_age_girls': '女孩体重-年龄对照表',
        'height_for_age_girls': '女孩身长/身高-年龄对照表',
    },
    'zh': {
        // Navigation
        'nav_dashboard': '仪表盘',
        'nav_statistics': '统计数据',
        'nav_sleep_pattern': '睡眠模式',
        'nav_body_data': '身体数据',
        'nav_settings': '设置',
        
        // Date Navigation
        'previous_day': '前一天',
        'next_day': '后一天',
        'today': '今天',
        
        // Care Records
        'care_records': '护理记录',
        'add_record': '添加新记录',
        'delete_selected': '删除所选',
        'time': '时间',
        'care_type': '护理类型',
        'details': '详情',
        'notes': '备注',
        'date': '日期',
        
        // Care Types
        'formula': '配方奶喂养',
        'breastfeeding': '母乳喂养',
        'diaper': '尿布更换',
        'select_care_type': '选择护理类型',
        'breast_milk_bottle': '瓶装母乳',
        'breast_milk_bottle_feeding': '瓶装母乳喂养',
        
        // Form Fields
        'volume': '容量 (毫升)',
        'duration': '时长 (分钟)',
        'diaper_type': '尿布类型',
        'date_and_time': '日期和时间',
        'pee': '小便',
        'poo': '大便',
        'both': '两者都有',
        'add_record_btn': '添加记录',
        'minutes': '分钟',
        'ml': '毫升',
        
        // Theme
        'dark_mode': '深色模式',
        'light_mode': '浅色模式',
        
        // Settings
        'language': '语言',
        'theme': '主题',
        'timezone': '时区',
        
        // Messages
        'record_added': '记录添加成功',
        'record_deleted': '记录删除成功',
        'error_occurred': '发生错误',
        'no_records': '此日期没有记录',
        'loading': '加载中...',
        'future_date': '不能选择未来日期',
        'no_records_found_for_this_date': '此日期没有找到记录',
        
        // Settings
        'settings_title': '设置',
        'settings_profile': '个人资料设置',
        'settings_upload_photo': '上传照片',
        'settings_parent_name': '父母姓名',
        'settings_baby_name': '宝宝姓名',
        'settings_baby_birthdate': '宝宝出生日期',
        'settings_save_profile': '保存资料',
        'settings_appearance': '外观',
        'settings_theme': '主题',
        'settings_theme_description': '选择深色或浅色主题',
        'settings_language': '语言',
        'settings_select_language': '选择语言',
        'settings_language_description': '选择您喜欢的语言',
        'settings_notifications': '通知',
        'settings_enable_notifications': '启用通知',
        'settings_notifications_description': '接收喂养、睡眠和其他事件的提醒',
        'settings_danger_zone': '危险区域',
        'settings_reset_data': '重置所有数据',
        'settings_reset_description': '这将永久删除您的所有数据',
        'settings_reset': '重置',
        'settings_confirm_reset': '确认重置',
        'settings_reset_warning': '您确定要重置所有数据吗？此操作无法撤消。',
        'settings_cancel': '取消',
        'settings_confirm': '是的，全部重置',
        'settings_profile_saved': '个人资料已保存',
        'settings_theme_dark': '已切换到深色主题',
        'settings_theme_light': '已切换到浅色主题',
        'settings_language_updated': '语言已更新',
        'settings_notifications_enabled': '通知已启用',
        'settings_notifications_disabled': '通知已禁用',
        'settings_reset_success': '数据已成功重置',
        
        // Languages
        'english': '英语',
        'chinese': '简体中文',
        
        // Other UI elements
        'toggle_theme': '切换主题',
        'baby_care': '婴儿护理',
        'volume_ml': '容量 (毫升)',
        'duration_min': '时长 (分钟)',
        'monday': '星期一',
        'tuesday': '星期二',
        'wednesday': '星期三',
        'thursday': '星期四',
        'friday': '星期五',
        'saturday': '星期六',
        'sunday': '星期日',
        'january': '一月',
        'february': '二月',
        'march': '三月',
        'april': '四月',
        'may': '五月',
        'june': '六月',
        'july': '七月',
        'august': '八月',
        'september': '九月',
        'october': '十月',
        'november': '十一月',
        'december': '十二月',
        'year': '年',
        'month': '月',
        'day': '日',
        
        // Notifications and Messages
        'record_added_successfully': '记录添加成功',
        'records_deleted_successfully': '记录删除成功',
        'failed_to_add_record': '添加记录失败',
        'failed_to_delete_records': '删除记录失败',
        'no_records_selected': '未选择任何记录',
        'are_you_sure_you_want_to_delete_selected_records': '确定要删除所选记录吗？',
        'server_connection_error': '服务器连接错误',
        'an_error_occurred': '发生错误',
        'cannot_select_future_dates': '不能选择未来日期',
        'failed_to_change_date': '更改日期失败',
        'switched_to': '已切换至',
        'mode': '模式',
        'language_changed': '语言已更改',
        
        // Statistics
        'start_date': '开始日期',
        'end_date': '结束日期',
        'update': '更新',
        'total_feedings': '总喂养次数',
        'latest_daily_volume': '最新日喂养量 (毫升)',
        'total_diapers': '总尿布更换',
        'avg_feedings_per_day': '日均喂养次数',
        'feeding_patterns': '喂养模式',
        'daily_volumes': '每日容量',
        'diaper_changes': '尿布更换',
        'diaper_changes_pee': '尿布更换 - 小便',
        'diaper_changes_poo': '尿布更换 - 大便',
        'care_distribution': '护理分布',
        'feedings': '喂养',
        'error_updating_statistics': '更新统计数据时出错',
        'statistics_updated': '统计数据已更新',
        'failed_to_fetch_statistics': '获取统计数据失败',
        'please_select_date_range': '请选择日期范围',
        'theme_changed': '主题已更改',
        
        // Sleep-related
        'sleep': '睡眠',
        'sleep_duration': '睡眠时长',
        'hours': '小时',
        'minutes': '分钟',
        'please_enter_valid_sleep_duration': '请输入有效的睡眠时长',
        'hours_must_be_between_0_and_24': '小时必须在0至24之间',
        'minutes_must_be_between_0_and_59': '分钟必须在0至59之间',
        
        // Sleep Pattern
        'sleep_pattern': '睡眠模式',
        'pattern': '模式',
        'select_week': '选择周',
        'this_week': '本周',
        'previous_week': '上一周',
        'next_week': '下一周',
        'week_of': '周开始于',
        'no_sleep_data': '本周没有睡眠数据',
        'hours_slept': '睡眠小时数',
        'day': '日',
        'mon': '周一',
        'tue': '周二',
        'wed': '周三',
        'thu': '周四',
        'fri': '周五',
        'sat': '周六',
        'sun': '周日',
        'error_navigating_week': '导航周时出错',
        'failed_to_load_sleep_data': '加载睡眠数据失败',
        'record': '条记录',
        'records': '条记录',
        'weekly_summary': '每周总结',
        'avg_sleep_time': '平均睡眠时间',
        'total_sleep_records': '睡眠记录总数',
        'total_sleep_time': '总睡眠时间',
        'retry': '重试',
        'hour': '小时',
        'session': '次',
        'sessions': '次',
        'failed_to_update_chart': '更新图表失败',
        'chart_container_not_found': '未找到图表容器',
        'failed_to_get_canvas_context': '无法获取画布上下文',
        'no_sleep_data_available': '没有可用的睡眠数据',
        'click_for_details': '点击睡眠块查看详情',
        'short_sleep': '短睡眠 (<30分钟)',
        'medium_sleep': '中等睡眠 (30分钟-2小时)',
        'long_sleep': '长时间睡眠 (>2小时)',
        'continues_next_day': '延续至次日',
        'continued_from_prev_day': '从前一天继续',

        // Body Data Page
        'body_data_title': '身体数据',
        'body_data_description': '记录和跟踪婴儿的体重和身高数据，观察生长发育曲线。',
        'growth_curves': '生长曲线',
        'weight_curve': '体重曲线',
        'height_curve': '身高曲线',
        'data_record': '数据记录',
        'record_date': '记录日期',
        'weight_kg': '体重 (kg)',
        'height_cm': '身高 (cm)',
        'save_data': '保存数据',
        'update_data': '更新数据',
        'cancel_record': '取消记录',
        'cancel_reason': '取消原因',
        'confirm_signature': '确认签名',
        'clear_signature': '清除签名',
        'submit_cancellation': '提交取消请求',
        'one_month': '1个月',
        'three_months': '3个月',
        'six_months': '6个月',
        'one_year': '1年',
        'all_data': '全部',
        'edit': '编辑',
        'delete': '删除',
        'weight': '体重',
        'height': '身高',
        'actions': '操作',
        'data_saved': '数据保存成功',
        'data_deleted': '数据删除成功',
        'error_saving_data': '保存数据时出错',
        'error_deleting_data': '删除数据时出错',
        'cancellation_submitted': '取消请求已提交',
        'please_fill_all_required_fields': '请填写所有必填字段',
        'please_fill_date_and_at_least_one_measurement': '请填写日期并至少填写一个测量值（体重或身高）',
        'please_provide_reason': '请提供原因',
        'please_confirm_with_signature': '请确认签名',
        'confirm_delete': '确定要删除这条记录吗？',
        'no_data': '无数据',
        'percentile_3': '第3百分位',
        'percentile_15': '第15百分位',
        'percentile_50': '第50百分位',
        'percentile_85': '第85百分位',
        'percentile_97': '第97百分位',
        'reference_curves': '参考曲线：',
        'male': '男孩',
        'female': '女孩',
        'cdc_growth_note': '以上生长曲线基于美国疾病控制与预防中心 (CDC) 标准生长曲线数据。参考曲线显示了婴幼儿在不同年龄段的第3、第50和第97百分位体重和身高数据。',
        'who_growth_note': '以上生长曲线基于世界卫生组织 (WHO) 标准生长曲线数据。参考曲线显示了婴幼儿在不同年龄段的第3、第15、第50、第85和第97百分位体重和身高数据。',
        'initialization_failed': '初始化失败',
        'error_occurred': '发生错误'
    }
};

// Language utilities
const i18n = {
    currentLocale: 'zh',
    
    init() {
        this.currentLocale = localStorage.getItem('language') || 'zh';
        document.documentElement.setAttribute('lang', this.currentLocale);
        this.updatePageContent();
    },
    
    setLocale(locale) {
        if (translations[locale]) {
            this.currentLocale = locale;
            localStorage.setItem('language', locale);
            document.documentElement.setAttribute('lang', locale);
            this.updatePageContent();
        }
    },
    
    t(key) {
        return translations[this.currentLocale]?.[key] || translations['en'][key] || key;
    },
    
    formatDate(date) {
        if (this.currentLocale === 'zh-CN') {
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            
            // Get weekday (0 = Sunday, 1 = Monday, etc.)
            const weekdayNum = date.getDay();
            // Map weekday number to translation key
            const weekdayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const weekday = this.t(weekdayKeys[weekdayNum]);
            
            return `${year}${this.t('year')}${month}${this.t('month')}${day}${this.t('day')}，${weekday}`;
        }
        
        return date.toLocaleDateString(this.currentLocale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    updatePageContent() {
        // Update all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (key) {
                if (element.tagName === 'INPUT' && element.getAttribute('placeholder')) {
                    element.placeholder = this.t(key);
                } else if (element.tagName === 'OPTION') {
                    element.textContent = this.t(key);
                } else {
                    element.textContent = this.t(key);
                }
            }
        });
        
        // Specifically handle select options for care types
        const careTypeSelect = document.getElementById('careType');
        if (careTypeSelect) {
            Array.from(careTypeSelect.options).forEach(option => {
                const key = option.getAttribute('data-i18n');
                if (key) {
                    option.textContent = this.t(key);
                }
            });
        }
        
        // Update date display format based on locale
        const dateDisplay = document.getElementById('currentDateDisplay');
        if (dateDisplay && window.currentDate) {
            const currentDate = new Date(window.currentDate + 'T00:00:00');
            dateDisplay.textContent = this.formatDate(currentDate);
        }

        // Update all elements with data-i18n-title attribute
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            if (key) {
                element.title = this.t(key);
            }
        });

        // Update theme switch text
        const themeSwitch = document.querySelector('.theme-switch span');
        if (themeSwitch) {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            themeSwitch.textContent = this.t(currentTheme === 'dark' ? 'dark_mode' : 'light_mode');
        }

        // Update form labels
        const volumeLabel = document.querySelector('label[for="volume"]');
        if (volumeLabel) {
            volumeLabel.textContent = this.t('volume_ml');
        }

        const durationLabel = document.querySelector('label[for="duration"]');
        if (durationLabel) {
            durationLabel.textContent = this.t('duration_min');
        }

        // Update table headers
        document.querySelectorAll('th[data-i18n]').forEach(header => {
            const key = header.getAttribute('data-i18n');
            header.textContent = this.t(key);
        });

        // Update logo text
        const logoText = document.querySelector('.sidebar-logo h2');
        if (logoText) {
            logoText.textContent = this.t('baby_care');
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { translations, i18n };
} 