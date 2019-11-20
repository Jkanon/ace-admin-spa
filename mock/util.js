const _ = require("../src/assets/components/lodash/lodash");

function removeDataIteratively(tableListDataSource, predicate) {
    const ret = _.remove(tableListDataSource, predicate);
    for (let i = 0; i < tableListDataSource.length; i += 1) {
        const record = tableListDataSource[i];
        if (record && record.children && record.children.length > 0) {
            const tmp = removeDataIteratively(record.children, predicate);
            if (tmp.length !== 0) {
                ret.push(...tmp);
                if (record.children.length === 0) {
                    record.children = undefined;
                }
            }
        }
    }

    return ret;
}


function deleteTableList(
    config,
    tableListDataSource,
    predicate
) {
    const { id } = config.params;
    if (id && tableListDataSource.length) {
        removeDataIteratively(
            tableListDataSource,
            predicate || (item => id.indexOf(item.id.toString()) !== -1),
        );
    }

    return {
        "success": true,
        "message": "操作成功！",
        "code": 200,
        "timestamp":Number(new Date())
    }
}

module.exports = {
    deleteTableList
};
