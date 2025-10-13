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

// import 'datatables.net-dt/css/jquery.dataTables.min.css';

const props = defineProps({
  title: String,
  tableId: String,
  headers: Array,
  columnDefs: Array,
  tableData: Array
});

let dataTableInstance = null;

// BR (D.3)
onMounted(() => {
  if (props.tableData && props.tableData.length > 0) {
    
    if ($.fn.DataTable.isDataTable(`#${props.tableId}`)) {
      $(`#${props.tableId}`).DataTable().destroy();
    }
    
    // initialize DataTables
    dataTableInstance = $(`#${props.tableId}`).DataTable({
      data: props.tableData,
      columns: props.columnDefs.map(def => ({ data: def.data })),
      // BR (D.3)
      paging: true,
      pageLength: 10,
      searching: true,
      ordering: true,
      responsive: true,
    });
    
    // BR (D.3) 
    $(`#${props.tableId} thead tr`).clone(true).appendTo(`#${props.tableId} thead`);
    $(`#${props.tableId} thead tr:eq(1) th`).each(function (i) {
      const title = $(this).text();

      $(this).html('<input type="text" placeholder="Search '+title+'" />');

      $('input', this).on('keyup change', function () {
        if (dataTableInstance.column(i).search() !== this.value) {
          dataTableInstance
            .column(i)
            .search(this.value)
            .draw();
        }
      });
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
</style>