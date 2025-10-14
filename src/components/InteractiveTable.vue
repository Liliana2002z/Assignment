<template>
  <div class="card p-4 shadow-sm mt-5">
    <h3 class="card-title">{{ title }}</h3>
    <div class="table-responsive">
        <table :id="tableId" class="display nowrap" style="width:100%">
            <thead>
                <tr>
                    <th v-for="header in headers" :key="header">{{ header }}</th>
                </tr>
                </thead>
            <tfoot> 
                <tr>
                    <th v-for="(header, i) in headers" :key="i">
                        </th>
                </tr>
            </tfoot>
            <tbody>
            </tbody>
        </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import $ from 'jquery';
import DataTable from 'datatables.net-dt'; 
import 'datatables.net-dt';

const props = defineProps({
  title: String,
  tableId: String,
  headers: Array,
  columnDefs: Array,
  tableData: Array
});

let dataTableInstance = null;

onMounted(() => {
  if (props.tableData && props.tableData.length > 0) {
    
    if ($.fn.DataTable.isDataTable(`#${props.tableId}`)) {
      $(`#${props.tableId}`).DataTable().destroy();
    }
    
    // 🚀 修复点 3：在 DataTables 初始化前创建单列搜索输入框
    $(`#${props.tableId} tfoot th`).each(function (i) {
      const title = $(this).parent().parent().parent().find('thead th').eq(i).text();
      // 使用 th 的 title 属性作为 aria-label 的基础
      $(this).html('<input type="text" placeholder="Search '+title+'" aria-label="Search by ' + title + '" />');
    });


    // initialize DataTables
    dataTableInstance = $(`#${props.tableId}`).DataTable({
      data: props.tableData,
      columns: props.columnDefs.map(def => ({ data: def.data })),
      // BR (D.3) 核心配置
      paging: true,
      pageLength: 10,
      searching: true, // 保持全局搜索开启
      ordering: true,
      responsive: true,
      initComplete: function () {
        // DataTables 初始化完成后绑定事件
        this.api().columns().every(function () {
          const that = this;
          $('input', this.footer()).on('keyup change clear', function () {
            if (that.search() !== this.value) {
              that.search(this.value).draw();
            }
          });
        });
      }
    });

  } else {
    console.warn(`No data provided for table ${props.tableId}`);
  }
});

onUnmounted(() => {
  if (dataTableInstance) {
    dataTableInstance.destroy();
  }
});
</script>

<style scoped>
:deep(.dataTables_wrapper .dataTables_length) {
    margin-bottom: 10px;
}
:deep(input[type="text"]) {
    width: 100%;
    padding: 3px;
    box-sizing: border-box;
}

/* 🚀 修复点 4：移除阻止全局搜索的样式 (可选) */
/* :deep(.dataTables_filter) {
    display: none; 
} */
</style>