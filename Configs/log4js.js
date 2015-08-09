{
    "appenders": [
		
        {
            "category": "configAuto",
            "type": "file",
            "filename": "Logs/configAuto.log",
            "pattern": "-yyyy-MM-dd",
            "layout": {
                "type": "pattern",
                "pattern": "%d{yyyy-MM-dd hh:mm:ss} %-5p %m"
            }
        },
        {
            "category": "recovery ",
            "type": "file",
            "filename": "Logs/recovery.log",
            "pattern": "-yyyy-MM-dd",
            "layout": {
                "type": "pattern",
                "pattern": "%d{yyyy-MM-dd hh:mm:ss} %-5p %m"
            }
        }
    ],
    "replaceConsole": true
}