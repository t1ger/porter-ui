/**
 * Created by lhyin on 2018/14/3.
 */
import React, {Component} from 'react';
import {Form, Button, Radio, Select, message, Row, Col, Table, Checkbox} from 'antd';
import {PageContent, PaginationComponent, QueryBar, Operator, FontIcon} from 'sx-ui/antd';
import * as promiseAjax from 'sx-ui/utils/promise-ajax';
import {session} from 'sx-ui/utils/storage';
import './style.less';
import connectComponent from '../../redux/store/connectComponent';

const FormItem = Form.Item;
const RadioGroup = Radio.Group;
export const PAGE_ROUTE = '/dataMap';
@Form.create()
export class LayoutComponent extends Component {
    state = {
        sourceTableName: '',
        leftTableData: [],
        selectedRowKeys: [],
        leftSelectedRow: [],
        targetTableName: '',
        rightTableData: [],
        rightSelectedRowKeys: [],
        rightSelectedRow: [],
        tables: [],
        tablesNameList: [],
        selectedDataTable: [],
        selectedTargetDataTable: [],
        ignoreTargetCase: false,
        forceMatched: false,
        directMapTable: false,
        ignoreTargetCaseDisabled: true,
        forceMatchedDisabled: true,
        directMapTableDisabled: true,
    };

    Columns = [
        {
            title: '源表名',
            render: (text, record) => {
                return (
                    record.sourceTableName
                );
            },

        },
        {
            title: '目标表名',
            render: (text, record) => {
                return (
                    record.targetTableName
                );
            },

        },
        {
            title: '忽略目标端大小写',
            render: (text, record) => {
                if (record.ignoreTargetCase) {
                    return (
                        '是'
                    );
                } else {
                    return (
                        '否'
                    )
                }
            },

        },
        {
            title: '目标端字段和源端字段一致',
            render: (text, record) => {
                if (record.forceMatched) {
                    return (
                        '是'
                    );
                } else {
                    return (
                        '否'
                    )
                }
            },

        },
        {
            title: '直接映射表',
            render: (text, record) => {
                if (record.directMapTable) {
                    return (
                        '是'
                    );
                } else {
                    return (
                        '否'
                    )
                }
            },

        },
        {
            title: '操作',
            render: (text, record) => {
                return (
                    <a onClick={() => this.handleDetail(record.sourceTableName,record.targetTableName)}>删除</a>
                );
            },

        },
    ]

    TableDataColumns = [
        {
            title: '列名',
            render: (text, record) => {
                return (
                    record.name
                );
            },

        },
    ];

    LeftSelectedTableDataColumns = [
        {
            title: '选中列名',
            render: (text, record) => {
                return (
                    record.name
                );
            },
        },
        {
            title: '操作',
            render: (text, record) => {
                return (
                    <a onClick={() => this.handleDeleteSourceDetail(record.name)}>删除</a>
                );
            },
        },
    ];

    RightSelectedTableDataColumns = [
        {
            title: '选中列名',
            render: (text, record) => {
                return (
                    record.name
                );
            },
        },
        {
            title: '操作',
            render: (text, record) => {
                return (
                    <a onClick={() => this.handleDeleteTargetDetail(record.name)}>删除</a>
                );
            },
        },
    ];

    /**
     * 删除映射关系
     */
    handleDetail = (sourceTableName, targetTableName)=> {
        const {tables, tablesNameList} =this.state;
        for (let i = 0; i < tables.length; i++) {
            if (tables[i].sourceTableName === sourceTableName && tables[i].targetTableName === targetTableName) {
                tables.splice(i, 1);
            }
        }

        for (let i = 0; i < tablesNameList.length; i++) {
            if (tablesNameList[i].sourceTableName === sourceTableName && tablesNameList[i].targetTableName === targetTableName) {
                tablesNameList.splice(i, 1);
            }
        }
        this.setState({tables, tablesNameList});
        console.log(tables);
        console.log(tablesNameList);
    };

    /**
     * 删除选中源表
     */
    handleDeleteSourceDetail = (name)=> {
        const {leftSelectedRow, selectedRowKeys} =this.state;
        for (let key in leftSelectedRow) {
            if (leftSelectedRow[key]['name'] === name) {
                leftSelectedRow.splice(key, 1);
            }
        }
        for (let key in selectedRowKeys) {
            if (selectedRowKeys[key] === name) {
                selectedRowKeys.splice(key, 1);
            }
        }

        console.log(selectedRowKeys);

        this.setState({
            leftSelectedRow,
            selectedRowKeys,
        });
    };

    /**
     * 删除选中目标表
     */
    handleDeleteTargetDetail = (name)=> {
        const {rightSelectedRow, rightSelectedRowKeys} =this.state;
        for (let key in rightSelectedRow) {
            if (rightSelectedRow[key]['name'] === name) {
                rightSelectedRow.splice(key, 1);
            }
        }
        for (let key in rightSelectedRowKeys) {
            if (rightSelectedRowKeys[key] === name) {
                rightSelectedRowKeys.splice(key, 1);
            }
        }

        console.log(rightSelectedRowKeys);

        this.setState({
            rightSelectedRow,
            rightSelectedRowKeys,
        });
    };


    componentWillMount() {
        const {selectedDataTable, selectedTargetDataTable} =this.props;
        this.setState({selectedDataTable, selectedTargetDataTable});
    }

    componentDidMount() {
        const {taskId, parentTables} =this.props;

        console.log('parentTables', parentTables);

        if (taskId != 'TaskId' || parentTables !== undefined) {
            const tablesNameList = [];
            for (let i = 0; i < parentTables.length; i++) {
                const tablesNameListItem = {};
                tablesNameListItem.sourceTableName = parentTables[i].sourceTableName;
                tablesNameListItem.targetTableName = parentTables[i].targetTableName;
                tablesNameListItem.ignoreTargetCase = parentTables[i].ignoreTargetCase;
                tablesNameListItem.forceMatched = parentTables[i].forceMatched;
                tablesNameListItem.directMapTable = parentTables[i].directMapTable;
                tablesNameListItem.id = i + 1;
                tablesNameList.push(tablesNameListItem);
            }
            this.setState({tables: parentTables, tablesNameList});
        }
    }


    changeDataSource(dataSource) {
        this.setState({
            selectedDataSource: dataSource,
        });
        console.log(dataSource);
    }

    renderSourceTableList = () => {
        const {selectedDataTable} =this.state;
        const arr = (selectedDataTable[0].tableName).split(",");
        return this.renderOption(arr);
    };

    renderTargetTableList = () => {
        const {selectedTargetDataTable} =this.state;
        const arr = (selectedTargetDataTable[0].tableName).split(",");
        return this.renderOption(arr);
    };

    renderOption = (arr)=> {
        const tableListHtml = [];
        for (let key in arr) {
            tableListHtml.push(<Select.Option key={arr[key]} value={arr[key]}>{arr[key]}</Select.Option>);
        }
        return tableListHtml;
    };

    /**
     * 选择源表
     */
    handleTableChange = (value)=> {
        const {selectedDataTable, targetTableName, rightTableData} =this.state;
        const params = {
            sourceId: selectedDataTable[0].sourceId,
            tablesId: selectedDataTable[0].id,
            tableAllName: value,
        }
        promiseAjax.get(`/jobtasks/fields`, params).then(rsp => {
            if (rsp.success) {
                var data = rsp.data;
                var newData = [];
                for (let k in data) {
                    let dataItem = {};
                    dataItem.name = data[k];
                    newData.push(dataItem);
                }
                console.log(newData);
                if (targetTableName === '') {
                    this.setState({
                        leftTableData: newData,
                        sourceTableName: value,
                        leftSelectedRow: [],
                        selectedRowKeys: [],
                        ignoreTargetCase: false,
                        forceMatched: false,
                        directMapTable: false,
                        ignoreTargetCaseDisabled: true,
                        forceMatchedDisabled: true,
                        directMapTableDisabled: true,
                    });
                } else {
                    if(newData.length != rightTableData.length){
                        this.setState({
                            leftTableData: newData,
                            sourceTableName: value,
                            leftSelectedRow: [],
                            selectedRowKeys: [],
                            ignoreTargetCase: false,
                            forceMatched: false,
                            directMapTable: false,
                            ignoreTargetCaseDisabled: false,
                            forceMatchedDisabled: true,
                            directMapTableDisabled: false,
                        });
                    } else {
                        this.setState({
                            leftTableData: newData,
                            sourceTableName: value,
                            leftSelectedRow: [],
                            selectedRowKeys: [],
                            ignoreTargetCase: false,
                            forceMatched: false,
                            directMapTable: false,
                            ignoreTargetCaseDisabled: false,
                            forceMatchedDisabled: false,
                            directMapTableDisabled: false,
                        });
                    }
                }

            }
        }).finally(() => {
        });
    };

    /**
     * 选择目标表
     */
    handleTargetTableChange = (value)=> {
        const {selectedTargetDataTable, sourceTableName, leftTableData} =this.state;
        const params = {
            sourceId: selectedTargetDataTable[0].sourceId,
            tablesId: selectedTargetDataTable[0].id,
            tableAllName: value,
        }
        promiseAjax.get(`/jobtasks/fields`, params).then(rsp => {
            if (rsp.success) {
                var data = rsp.data;
                var newData = [];
                for (let k in data) {
                    let dataItem = {};
                    dataItem.name = data[k];
                    newData.push(dataItem);
                }
                console.log(newData);
                if (sourceTableName === '') {
                    this.setState({
                        rightTableData: newData,
                        targetTableName: value,
                        rightSelectedRow: [],
                        rightSelectedRowKeys: [],
                        ignoreTargetCase: false,
                        forceMatched: false,
                        directMapTable: false,
                        ignoreTargetCaseDisabled: true,
                        forceMatchedDisabled: true,
                        directMapTableDisabled: true,
                    });
                } else {
                    if(newData.length != leftTableData.length){
                        this.setState({
                            rightTableData: newData,
                            targetTableName: value,
                            rightSelectedRow: [],
                            rightSelectedRowKeys: [],
                            ignoreTargetCase: false,
                            forceMatched: false,
                            directMapTable: false,
                            ignoreTargetCaseDisabled: false,
                            forceMatchedDisabled: true,
                            directMapTableDisabled: false,
                        });
                    } else {
                        this.setState({
                            rightTableData: newData,
                            targetTableName: value,
                            rightSelectedRow: [],
                            rightSelectedRowKeys: [],
                            ignoreTargetCase: false,
                            forceMatched: false,
                            directMapTable: false,
                            ignoreTargetCaseDisabled: false,
                            forceMatchedDisabled: false,
                            directMapTableDisabled: false,
                        });
                    }
                }

            }
        }).finally(() => {
        });
    };

    /**
     * 保存选中的数据
     */
    handleSave = () => {
        const {form:{setFieldsValue}} =this.props;
        const {sourceTableName, targetTableName, leftSelectedRow, rightSelectedRow, tables, tablesNameList, directMapTable, forceMatched, leftTableData, rightTableData}= this.state;
        let flag = true;
        let forceFlag = true;

        if (tablesNameList.length > 0) {
            for (let i = 0; i < tablesNameList.length; i++) {
                if (tablesNameList[i].sourceTableName === sourceTableName && tablesNameList[i].targetTableName === targetTableName) {
                    flag = false;
                    break;
                }
            }
        }

        if (forceMatched) {
            if (leftSelectedRow.length != leftTableData.length || rightSelectedRow.length != rightTableData.length) {
                forceFlag = false;
            }
        }

        if (leftSelectedRow === '' || targetTableName === '') {
            message.warning('请选择源表或目标表', 3);
        } else if ((leftSelectedRow.length === 0 || rightSelectedRow.length === 0) && !this.state.directMapTable) {
            message.warning('请选择表字段', 3);
        } else if (leftSelectedRow.length != rightSelectedRow.length) {
            message.warning('映射字段信息有误,请检查', 3);
        } else if (flag === false) {
            message.warning('请勿重复添加表映射关系', 3);
        } else if (forceFlag === false) {
            message.warning('强制目标端字段和源端字段一致时,需要全选表字段', 3);
        } else {
            const tableItem = {};
            const fields = [];
            const tablesName = {};
            for (let i = 0; i < leftSelectedRow.length; i++) {
                const fieldsItem = {};
                fieldsItem.sortOrder = i + 1;
                fieldsItem.sourceTableName = sourceTableName;
                fieldsItem.targetTableName = targetTableName;
                fieldsItem.sourceTableField = leftSelectedRow[i].name;
                fieldsItem.targetTableField = rightSelectedRow[i].name;
                fields.push(fieldsItem);
            }
            tableItem.fields = directMapTable ? [] : fields;
            tableItem.sourceTableName = sourceTableName;
            tableItem.targetTableName = targetTableName;
            tableItem.ignoreTargetCase = this.state.ignoreTargetCase;
            tableItem.forceMatched = this.state.forceMatched;
            tableItem.directMapTable = this.state.directMapTable;
            tablesName.sourceTableName = sourceTableName;
            tablesName.targetTableName = targetTableName;
            tablesName.ignoreTargetCase = this.state.ignoreTargetCase;
            tablesName.forceMatched = this.state.forceMatched;
            tablesName.directMapTable = this.state.directMapTable;
            // tablesName.id = tablesNameList.length;
            tablesName.id = sourceTableName + '_' + targetTableName;
            tables.push(tableItem);
            tablesNameList.push(tablesName);
            console.log('tables', tables);
            console.log('tablesNameList', tablesNameList);
            this.setState({
                tables,
                tablesNameList,
                sourceTableName: '',
                leftTableData: [],
                selectedRowKeys: [],
                leftSelectedRow: [],
                targetTableName: '',
                rightTableData: [],
                rightSelectedRowKeys: [],
                rightSelectedRow: [],
                ignoreTargetCase: false,
                forceMatched: false,
                directMapTable: false,
                ignoreTargetCaseDisabled: true,
                forceMatchedDisabled: true,
                directMapTableDisabled: true,
            });
            setFieldsValue({sourceTableName: ''});
            setFieldsValue({targetTableName: ''});

            // 保存数据映射关系
            this.props.saveDataMap(tables);
        }
    };

    /**
     * 忽略目标端大小写
     * @param e
     */
    onIgnoreChange = (e) => {
        if (e.target.checked) {
            this.setState({ignoreTargetCase: true});
        } else {
            this.setState({ignoreTargetCase: false});
        }
    }

    /**
     * 强制目标端字段和源端字段一致(针对目标表来说)
     * @param e
     */
    onMatchedChange = (e) => {
        const {leftTableData, rightTableData} = this.state;
        let newLeftTableData = [...leftTableData];
        let newRightTableData = [...rightTableData];
        if (e.target.checked) {
            let leftCheckedList = [],
                rightCheckedList = [];
            if (newLeftTableData.length > 0) {
                newLeftTableData.map(item => {
                    leftCheckedList.push(item.name);
                });
            }
            if (newRightTableData.length > 0) {
                newRightTableData.map(item => {
                    rightCheckedList.push(item.name);
                });
            }
            this.setState({
                forceMatched: true,
                directMapTable: false,
                directMapTableDisabled: true,
                selectedRowKeys: leftCheckedList,
                rightSelectedRowKeys: rightCheckedList,
                leftSelectedRow: newLeftTableData,
                rightSelectedRow: newRightTableData,
            });
        } else {
            this.setState({
                forceMatched: false,
                directMapTableDisabled: false,
                selectedRowKeys: [],
                rightSelectedRowKeys: [],
                leftSelectedRow: [],
                rightSelectedRow: [],
            });
        }
    }

    /**
     * 直接映射表，不进行表字段映射配置 默认false
     * @param e
     */
    onDirectMapChange = (e) => {
        if (e.target.checked) {
            this.setState({directMapTable: true, forceMatched: false, forceMatchedDisabled: true});
            setTimeout(()=> {
                this.handleSave();
            }, 500);
        } else {
            this.setState({directMapTable: false, forceMatchedDisabled: false});
        }
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const {leftTableData, selectedRowKeys, leftSelectedRow, rightTableData, rightSelectedRowKeys, rightSelectedRow, tables, tablesNameList} =this.state;
        const formItemLayout = {
            labelCol: {
                xs: {span: 24},
                sm: {span: 5},
            },
            wrapperCol: {
                xs: {span: 24},
                sm: {span: 15},
            },
        };

        console.log('leftTableData', leftTableData);

        const rowSelectionLeft = {
            selectedRowKeys,
            onSelect: (record, selected, selectedRows) => {
                if (selected) {
                    for (let key in leftTableData) {
                        if (leftTableData[key]['name'] === record['name']) {
                            leftSelectedRow.push(leftTableData[key]);
                        }
                    }
                } else {
                    for (let key in leftSelectedRow) {
                        if (leftSelectedRow[key]['name'] === record['name']) {
                            leftSelectedRow.splice(key, 1);
                        }
                    }
                }
                this.setState({
                    leftSelectedRow,
                });
            },

            onSelectAll: (selected, selectedRows, changeRows) => {
                console.log(selected, selectedRows, changeRows);
                if (selected) {
                    for (let i = 0; i < changeRows.length; i++) {
                        leftSelectedRow.push(changeRows[i]);
                    }
                } else {
                    const newRightData = this.state.leftSelectedRow;
                    for (let i = 0; i < changeRows.length; i++) {
                        for (let j = 0; j < newRightData.length; j++) {
                            if (newRightData[j].name === changeRows[i].name) {
                                leftSelectedRow.splice(j, 1);
                            }
                        }
                    }
                }
                this.setState({
                    leftSelectedRow,
                });
            },

            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({selectedRowKeys});
            }
        };

        const rowSelectionRight = {
            selectedRowKeys: rightSelectedRowKeys,
            onSelect: (record, selected, selectedRows) => {
                if (selected) {
                    for (let key in rightTableData) {
                        if (rightTableData[key]['name'] === record['name']) {
                            rightSelectedRow.push(rightTableData[key]);
                        }
                    }
                } else {
                    for (let key in rightSelectedRow) {
                        if (rightSelectedRow[key]['name'] === record['name']) {
                            rightSelectedRow.splice(key, 1);
                        }
                    }
                }
                this.setState({
                    rightSelectedRow,
                });
                console.log(rightSelectedRow);
            },

            onSelectAll: (selected, selectedRows, changeRows) => {
                console.log(selected, selectedRows, changeRows);
                if (selected) {
                    for (let i = 0; i < changeRows.length; i++) {
                        rightSelectedRow.push(changeRows[i]);
                    }
                } else {
                    const newRightData = this.state.rightSelectedRow;
                    for (let i = 0; i < changeRows.length; i++) {
                        for (let j = 0; j < newRightData.length; j++) {
                            if (newRightData[j].name === changeRows[i].name) {
                                rightSelectedRow.splice(j, 1);
                            }
                        }
                    }
                }
                this.setState({
                    rightSelectedRow,
                });
            },

            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({rightSelectedRowKeys: selectedRowKeys});
            }
        };

        const expandedRowRender = (sourceTableName, targetTableName) => {
            console.log(sourceTableName, targetTableName);

            let dataColumn = [];
            for (let i = 0; i < tables.length; i++) {
                if (tables[i].sourceTableName === sourceTableName && tables[i].targetTableName === targetTableName) {
                    dataColumn = tables[i].fields;
                }
            }
            // for (let i = 0; i < tables.length; i++) {
            //     if (tables[i].id === id) {
            //         dataColumn = tables[i].fields;
            //     }
            // }
            const columns = [
                {title: '源表列名', dataIndex: 'sourceTableField', key: 'sourceTableField'},
                {title: '目标表列名', dataIndex: 'targetTableField', key: 'targetTableField'},
            ];
            return (
                <Table
                    columns={columns}
                    dataSource={dataColumn}
                    rowKey={(record) => record.sortOrder}
                    pagination={false}
                />
            );
        };
        return (
            <PageContent>
                <div className="steps4-content">
                    <Row>
                        <Col span={12} className="table-item">
                            <Row>
                                <Col span={24}>
                                    <FormItem
                                        {...formItemLayout}
                                        label="源表"
                                        hasFeedback
                                    >
                                        {getFieldDecorator('sourceTableName')(
                                            <Select
                                                style={{ width: '100%' }}
                                                placeholder="请选择源表"
                                                onChange={this.handleTableChange}
                                            >
                                                {this.renderSourceTableList()}
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={12} className="table-item">
                            <Row>
                                <Col span={24}>
                                    <FormItem
                                        {...formItemLayout}
                                        label="目标表"
                                        hasFeedback
                                    >
                                        {getFieldDecorator('targetTableName')(
                                            <Select
                                                style={{ width: '100%' }}
                                                placeholder="请选择目标表"
                                                onChange={this.handleTargetTableChange}
                                            >
                                                {this.renderTargetTableList()}
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>

                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} style={{padding: 15, paddingTop: 0}}>
                            <Checkbox style={{marginRight: 20}} checked={this.state.ignoreTargetCase}
                                      defaultChecked={this.state.ignoreTargetCase}
                                      disabled={this.state.ignoreTargetCaseDisabled}
                                      onChange={this.onIgnoreChange}>忽略目标端大小写</Checkbox>
                            <Checkbox style={{marginRight: 20}} checked={this.state.forceMatched}
                                      defaultChecked={this.state.forceMatched}
                                      onChange={this.onMatchedChange}
                                      disabled={this.state.forceMatchedDisabled}>强制目标端字段和源端字段一致</Checkbox>
                            <Checkbox defaultChecked={this.state.directMapTable} checked={this.state.directMapTable}
                                      onChange={this.onDirectMapChange} disabled={this.state.directMapTableDisabled}>直接映射表，不进行表字段映射配置</Checkbox>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12} className="table-item">
                            <Row>
                                {
                                    !this.state.directMapTable ? <Col span={24} className="table-height">
                                        <Table
                                            rowSelection={rowSelectionLeft}
                                            size="middle"
                                            rowKey={(record) => record.name}
                                            columns={this.TableDataColumns}
                                            dataSource={leftTableData}
                                            pagination={false}
                                        />
                                    </Col> : null
                                }
                            </Row>
                            {
                                !this.state.directMapTable ? <Row>
                                    <Col span={24} className="fa-down">
                                        <FontIcon type="fa-arrow-down"/>
                                    </Col>
                                </Row> : null
                            }
                        </Col>
                        <Col span={12} className="table-item">
                            <Row>
                                {
                                    !this.state.directMapTable ? <Col span={24} className="table-height">
                                        <Table
                                            rowSelection={rowSelectionRight}
                                            size="middle"
                                            rowKey={(record) => record.name}
                                            columns={this.TableDataColumns}
                                            dataSource={rightTableData}
                                            pagination={false}
                                        />
                                    </Col> : null
                                }

                            </Row>
                            {
                                !this.state.directMapTable ? <Row>
                                    <Col span={24} className="fa-down">
                                        <FontIcon type="fa-arrow-down"/>
                                    </Col>
                                </Row> : null
                            }
                        </Col>
                    </Row>
                    {
                        !this.state.directMapTable ? <Row>
                            <Col span={12} className="table-item">
                                <Row>
                                    <Col span={24} className="table-height">
                                        <Table
                                            size="middle"
                                            rowKey={(record) => record.name}
                                            columns={this.LeftSelectedTableDataColumns}
                                            dataSource={leftSelectedRow}
                                            pagination={false}
                                        />
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={12} className="table-item">
                                <Row>
                                    <Col span={24} className="table-height">
                                        <Table
                                            size="middle"
                                            rowKey={(record) => record.name}
                                            columns={this.RightSelectedTableDataColumns}
                                            dataSource={rightSelectedRow}
                                            pagination={false}
                                        />
                                    </Col>
                                </Row>
                            </Col>
                        </Row> : null
                    }
                    <Row>
                        <Col span={24}>
                            <Button type="primary" onClick={() => this.handleSave()}
                                    style={{marginTop: 20, marginLeft: 15}} size="large">保存</Button>
                        </Col>
                    </Row>

                    <Row>
                        <Col span={24} className="table-item">
                            <div className="sub-title">数据映射关系</div>
                            <Table
                                size="middle"
                                rowKey={(record) => record.id}
                                columns={this.Columns}
                                dataSource={tablesNameList}
                                expandedRowRender={(record) => expandedRowRender(record.sourceTableName, record.targetTableName)}
                                pagination={false}
                            />
                        </Col>
                    </Row>
                </div>
            </PageContent>
        )
    }
}

export function mapStateToProps(state) {
    return {
        ...state.frame,
    };
}
export default connectComponent({LayoutComponent, mapStateToProps});
