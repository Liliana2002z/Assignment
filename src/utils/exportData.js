// src/utils/exportData.js

/**
 * 将 JSON 数据转换为 CSV 格式并触发下载。
 * @param {Array<Object>} jsonData 要导出的 JSON 数组
 * @param {string} fileName 导出的文件名 (例如: 'user_data')
 */
export function exportToCSV(jsonData, fileName = 'data_export') {
    if (!jsonData || jsonData.length === 0) {
        alert("No data to export.");
        return;
    }

    // 1. 获取表头 (Keys)
    const headers = Object.keys(jsonData[0]);
    
    // 2. 格式化 CSV 头部
    // 确保使用 UTF-8 BOM 来避免中文字符乱码
    const BOM = '\ufeff'; 
    const csvHeader = BOM + headers.join(',') + '\n';
    
    // 3. 格式化 CSV 数据体
    const csvBody = jsonData.map(row => {
        return headers.map(header => {
            // 处理包含逗号、引号或换行符的单元格（使用双引号包裹）
            let value = row[header] === null || row[header] === undefined ? '' : row[header];
            if (typeof value === 'string') {
                value = value.replace(/"/g, '""'); // 转义双引号
                // 如果值中包含逗号、换行符或引号，则用双引号包裹
                if (value.includes(',') || value.includes('\n') || value.includes('"')) {
                    value = `"${value}"`; 
                }
            }
            return value;
        }).join(',');
    }).join('\n');

    const csvContent = csvHeader + csvBody;

    // 4. 触发浏览器下载
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) { 
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName + '.csv');
        // 模拟点击下载
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        alert(`Data successfully exported to ${fileName}.csv!`);
    } else {
        alert("Your browser does not support automatic downloads.");
    }
}