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
            "category": "history",
            "type": "file",
            "filename": "Logs/history.log",
            "pattern": "-yyyy-MM-dd",
            "layout": {
                "type": "pattern",
                "pattern": "%d{yyyy-MM-dd hh:mm:ss} %-5p %m"
            }
        }
    ],
    "replaceConsole": true
}