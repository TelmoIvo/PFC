var states = Ext.create('Ext.data.Store', {
    fields: ['abbr', 'name'],
    data: [
        {"cor": "Amarelo"},
        {"cor": "Laranja"},
        {"cor": "Vermelho"},
        {"cor": "Verde"},

    ]
});
var mySimpleStore=null;
Ext.define('RRD',{ extend: 'Ext.data.Model',
    fields: [
        {name: 'comment', type:'string'}
    ]
});



Ext.define('DevJS.view.users.List', {
    extend: 'Ext.grid.Panel',
    autoHeight: true,
    forceFit: true,
    viewConfig: {
        autoFill: true,
        scrollOffset: 0
    },
    xtype: 'usersList',
    title: 'Moduł użytkowników',
    viewConfig: {
        enableTextSelection: true,
        stripeRows: true,
        listeners: {
            rowselect: function (sm, row, rec) {
                Ext.getCmp("form").getForm().loadRecord(rec);
            },
            refresh: function (dataview) {
                Ext.each(dataview.panel.columns, function (column) {
                    if (column.autoSizeColumn === true)
                        column.autoSize();
                })
            }
        }
    },

    store: 'Users',

    initComponent: function () {
        var me = this,
            rowEditing = Ext.create('Ext.grid.plugin.RowEditing', {
                clicksToEdit: 2
            }),
            rowMenu = Ext.create('Ext.menu.Menu', {
                height: 58,
                items: [{
                    text: 'Edit',
                    iconCls: 'button-edit'
                }, {
                    text: 'Remove',
                    iconCls: 'button-remove',
                    handler: function () {
                        me.fireEvent('removeRow', this);
                    }
                }]
            });

        this.listeners = {
            itemcontextmenu: function (view, record, item, index, e) {
                e.stopEvent();
                rowMenu.showAt(e.getXY());
            }
        };

        this.plugins = [rowEditing];
        this.selType = 'rowmodel';
        this.dockedItems = [
            {
                xtype: 'pagingtoolbar',
                dock: 'top',
                displayInfo: true,
                store: 'Users'
            }
        ];


        this.columns = [
            {text: 'Id', dataIndex: '_id', hidden: true},
            {
                text: 'Vid',
                dataIndex: 'vid',
                autoSizeColumn: true

            },
            {
                text: 'TMX',
                dataIndex: 'tmx',
                name: 'tmx',
                autoSizeColumn: true
            },
            {
                text: 'Causa',
                dataIndex: 'anomalia',
                renderer: function (value, metaData, record, row, col, store, gridView) {
                    String.prototype.contains = function (v) {
                        return this.indexOf(it) != -1;
                    };
                    if (value.indexOf("FLAPPING") != -1) {
                        return '<img src="../images/admin/icons/podcast.png">' + value;
                    }
                    else {
                        return value;
                    }
                },
                autoSizeColumn: true

            },
            {
                text: 'Nivel de Alerta',
                dataIndex: 'cor',
                autoSizeColumn: true,
                editor: {
                    xtype: 'combo',
                    store: new Ext.data.SimpleStore({
                        data: [['Vermelho'],
                            ['Laranja'],
                            ['Amarelo'],
                            ['Verde']],
                        id: 1,
                        fields: ['text']
                    }),
                    valueField: 'text',
                    value: 0,
                    displayField: 'text',
                    triggerAction: 'all',
                    editable: false,
                    flex: 1,
                    listeners: {
                        'select': function (combo, record) {
                            closedStatusSelectedID = this.getValue();
                        }
                    }
                }
            }, {
                text: 'Comments',
                dataIndex: 'comments',
                name: 'comments',
                autoSizeColumn: true,
                renderer: function (value) {

                    return value.length;
                }
            },
            {
                xtype: 'actioncolumn',
                autoSizeColumn: true,
                items: [
                    {
                        iconCls: 'button-edit',
                        tooltip: 'Edit',
                        handler: function (grid, rowIndex, colIndex) {
                            this.up('grid').fireEvent('editRow', grid, rowIndex, colIndex);
                        }
                    },
                    {
                        iconCls: 'button-info',
                        itemId: 'Comments',
                        text: 'Comments',
                        handler: function (grid, rowIndex, colIndex) {
                            win.record = grid.getStore().getAt(rowIndex);
                            win.show()
                        }
                    }
                ]
            }
        ];

        //parent
        this.callParent(arguments);
    }
});

var form = new Ext.form.FormPanel({
    width: 500,
    items: [{
        xtype: 'displayfield',
        name: 'vid'
    }, {
        xtype: 'displayfield',
        name: 'tmx'
    },
        {
            xtype: 'displayfield',
            name: 'comments'
        },{
        xtype        : 'grid',
            columns: [
                { text : 'comments',name:'comments', flex : 1, sortable : true, dataIndex: 'comments' },
            ],
            height: 300,
            width: 300
        }
    ]
});

var win = new Ext.Window({
    title: 'Comments',
    closeAction: 'hide',
    closable: true,
    items: [{
        xtype: 'panel',
        items: [form]
    }],
    listeners: {
        beforeshow: function (window) {
            if (window.record) form.getForm().loadRecord(window.record);

        }
    }
});

