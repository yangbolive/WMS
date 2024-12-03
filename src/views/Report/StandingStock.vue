<template>
  <div style="margin: 10px">
    <el-form
      :label-position="labelPosition2"
      label-width="auto"
      :model="filters"
      style="max-width: 100%"
    >
      <el-row class="el-row">
        <el-col :span="8" class="el-col">
          <div class="grid-content ep-bg-purple">
            <el-form-item label="产品编号:">
              <el-input
                v-model="filters.cinvcode"
                placeholder="请输入产品编号"
              />
            </el-form-item>
          </div>
        </el-col>
        <el-col :span="8" class="el-col">
          <div class="grid-content ep-bg-purple">
            <el-form-item label="产品名称:">
              <el-input
                v-model="filters.cinvname"
                placeholder="请输入产品名称"
              />
            </el-form-item>
          </div>
        </el-col>
        <el-col :span="8" class="el-col">
          <div class="grid-content ep-bg-purple">
            <el-form-item label="批号:">
              <el-input v-model="filters.cbatch" placeholder="请输入批号" />
            </el-form-item>
          </div>
        </el-col>
      </el-row>

      <el-row class="el-row">
        <el-col :span="8" class="el-col">
          <div class="grid-content ep-bg-purple">
            <el-form-item label="区域名称:">
              <el-select
                v-model="filters.cposccode"
                clearable
                filterable
                placeholder="请选择区域"
              >
                <el-option
                  v-for="item in cposcList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </div>
        </el-col>
        <el-col :span="8" class="el-col">
          <div class="grid-content ep-bg-purple">
            <el-form-item label="货位:">
              <el-select
                v-model="filters.cposcode"
                clearable
                filterable
                placeholder="请选择货位"
              >
                <el-option
                  v-for="item in cposList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </div>
        </el-col>
      </el-row>

      <el-row class="el-row">
        <el-col :span="2" class="el-col">
          <el-button @click="loadData" type="danger">
            <span>查询</span></el-button
          >
          <!-- <el-tooltip
        class="box-item"
        effect="dark"
        content="勾选列表项可一次性批量打印多张单据"
        placement="bottom-start"
      >
      <el-button @click="loadData" type="default" plain> <span>批量打印</span></el-button>    
      </el-tooltip>
      <el-tooltip
        class="box-item"
        effect="dark"
        content="预览所勾选的第一张单据"
        placement="bottom-start"
      >
      <el-button @click="loadData" type="default" plain> <span>单张预览</span></el-button>   
      </el-tooltip> -->
        </el-col>
        <el-col :span="20" class="el-col">
          <el-button @click="dialogVisibleClick" class type="success"
            >选择栏目</el-button
          >
        </el-col>
      </el-row>
      <el-row class="el-row">
        <el-table
          v-if="!headerData1.length"
          :data="fiterBodyData_List()"
          style="width: 100%"
          highlight-current-row
          :row-class-name="tableRowClassName"
          ref="multipleTableRef"
          border
        >
          <!-- <el-table-column  prop="selected"  type="selection" width="55" :sortable="true" fixed/> -->
          <el-table-column prop="cinvcode" label="产品编码" width="200" />
          <el-table-column prop="cinvname" label="产品名称" width="220" />
          <el-table-column prop="cinvstd" label="规格型号" width="250" />
          <el-table-column prop="cComUnitName" label="计量单位" width="130" />
          <el-table-column prop="qty" label="数量" width="120" />
          <el-table-column prop="cbatch" label="批号" width="120" />
          <el-table-column prop="cposcode" label="货位编码" width="160" />
          <el-table-column prop="cposname" label="货位名称" width="160" />
          <el-table-column prop="cposccode" label="区域编码" width="160" />
          <el-table-column prop="cposcname" label="区域名称" width="160" />
        </el-table>
        <el-table
          v-if="headerData1.length"
          :data="fiterBodyData_List()"
          style="width: 100%"
          highlight-current-row
          ref="multipleTableRef"
          border
        >
          <el-table-column
            v-for="(item, index) in headerData1"
            :prop="item.defaultname"
            :key="index"
            :width="item.width"
            :label="item.name"
          >
          </el-table-column>
        </el-table>
      </el-row>
      <el-row class="el-row">
        <div style="padding: 10px 0">
          <el-pagination
            @size-change="handleSizeChange_List"
            @current-change="handleCurrentChange_List"
            :current-page="pageNum_List"
            :pager-count="13"
            :page-sizes="[10, 20, 40, 50, 100]"
            :page-size="pageSize_List"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total_List"
          >
          </el-pagination>
        </div>
      </el-row>
    </el-form>

    <el-dialog
      v-model="dialogVisible"
      title="存货编码"
      @close="dialogVisible = false"
      width="70%"
      :draggable="false"
    >
      <cinvcodeDialog
        @recognize="recognize"
        @determine="determine"
        v-if="dialogVisible"
        ref="refAsnvoucher"
      >
      </cinvcodeDialog>
    </el-dialog>

    <el-dialog
      v-model="dialogVisible1"
      title="选择栏目"
      @close="dialogVisible1 = false"
      width="70%"
      :draggable="false"
    >
      <orderTable
        @determine="determine"
        @close="dialogVisible1 = false"
        :destroy-on-close="true"
        :headerData="headerData2"
        :tame="tname"
        :SysInfo="SysInfo"
      />
    </el-dialog>
  </div>
</template>

<script lang="ts">
import { reactive, ref } from "vue";
import type { FormProps } from "element-plus";
import { onMounted, onUnmounted } from "vue";
import axios from "axios";
import { getCurrentInstance } from "vue";

import { ElMessageBox, ElMessage, ElLoading } from "element-plus";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { fa } from "element-plus/es/locale";

export default {
  components: {},
  setup() {
    const instance = getCurrentInstance();
    const globalObject =
      instance?.appContext.config.globalProperties.$myGlobalObject;

    const labelPosition = ref<FormProps["labelPosition"]>("right");
    const labelPosition2 = ref<FormProps["labelPosition"]>("right");
    const formLabelAlign = reactive({
      name: "",
      region: "",
      type: "",
    });

    interface User {
      selected: boolean;
      date: string;
      name: string;
      address: string;
    }

    const tableRowClassName = ({
      row,
      rowIndex,
    }: {
      row: User;
      rowIndex: number;
    }) => {
      if (rowIndex === 1) {
        return "warning-row";
      } else if (rowIndex === 3) {
        return "success-row";
      }
      return "";
    };

    interface ShortcutItem {
      text: string;
      value: () => Date[]; // 假设 getLastWeek 等方法返回 Date 数组
    }
    // 定义 Last week 的函数
    const getLastWeek = () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
      return [start, end];
    };
    // 定义 Last month 的函数
    const getLastMonth = () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
      return [start, end];
    };

    // 定义 Last 3 months 的函数
    const getLast3Months = () => {
      const end = new Date();
      const start = new Date();
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
      return [start, end];
    };

    const getThisMonth = () => {
      const today = new Date();
      const firstDayOfThisMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      );
      return [firstDayOfThisMonth, today];
    };
    const shortcuts: ShortcutItem[] = [
      {
        text: "前一周",
        value: getLastWeek,
      },
      {
        text: "前一月",
        value: getLastMonth,
      },
      {
        text: "前三个月",
        value: getLast3Months,
      },
      {
        text: "本月",
        value: getThisMonth,
      },
    ];

    return {
      // 返回组件中可使用的属性和方法
      labelPosition,
      labelPosition2,
      formLabelAlign,
      tableRowClassName,
      globalObject,
      shortcuts,
    };
  },

  data() {
    return {
      name: "John", // Option API：使用 data 方法定义数据
      tTable: reactive({}),
      testObj: { vouchDate: "" },
      tableData2: [],
      dialogVisible: false,
      dialogVisible1: false,
      dialogVisible2: false,
      headerData: {
        vouchCode: "",
        cinvcode: "",
        cvouchtype: "",
        cwhname: "",
        vouchDate: "",
        dpodate: "",
        zhuangtai: "",
        dhfs: "",
        contacts: "",
        phone: "",
        cheadmemo: "",
        fahuori: "",
        yujidaohuori: "",
        cMemo: "",
        cbmemo: "",
        crdname: "",
      },
      bodyData: [],
      bodyDataCopypolist_asn: [],
      filters: {
        vouchCode: "",
        cdepName: "",
        cinvstd: "",
        vouchDate: ref(""),
        cinvcode: "",
        cvouchtype: "",
        cposccode: "",
        dpodate: ref(""),
        zhuangtai: "",
        cposcode: "",
        cMemo: "",
        cbmemo: "",
        crdname: "",
        stats: "",
        cinvname: "",
        cbatch: "",
      },
      pageNum_List: 1,
      pageSize_List: 10,
      total_List: 0,
      multipleSelection_List: [],
      bodymultipleSelection: [],
      headerData1: [] as HeaderItem[],
      headerData2: [] as HeaderItem[],
      cposcList: [
        {
          value: "",
          label: "",
        },
      ],
      cposList: [
        {
          value: "",
          label: "",
        },
      ],
      cvouchtypeList: [
        {
          value: "",
          label: "",
        },
      ],
      cdepNameList: [
        {
          value: "",
          label: "",
        },
      ],
      crdnameList: [
        {
          value: "",
          label: "",
        },
      ],
      ElSelectLoading: false,
      ElSelectValue: "",
      ElSelectOptions: [{ value: "", label: "" }],
      fullscreenLoading: false,
      zhuangtaiList: [
        { value: "1", label: "已生单" },
        { value: "0", label: "未生单" },
      ],
      VouchID: "",
      SysInfo: {
        cUserId: "demo",
        cVenCode: "-1",
        database: "ufsystm",
        ApiUrl: "",
        roles: "",
      },
      tname: "OoList",
    };
  },
  // async mounted(){
  //   console.log('mounted')
  //   const res = await this.SqlWork("select","select null a,2 b" );

  // },
  async mounted() {
    console.log("mounted");
    const database = sessionStorage.getItem("cDatabase");
    const cUserId = sessionStorage.getItem("username");
    const cVenCode = sessionStorage.getItem("cVenCode");
    var roles = sessionStorage.getItem("roles");
    //区域列表
    let cposcList = await this.SqlWork(
      "select",
      `select cposccode,cposcname from wlzh_Dz_positionClass`
    );
    console.log("cposcList", cposcList.data);
    this.cposcList = [];
    cposcList.data.forEach((item: any) => {
      this.cposcList.push({ value: item.cposccode, label: item.cposcname });
    });
    //货位列表
    let cposList = await this.SqlWork(
      "select",
      `select cposcode,cposname from wlzh_Dz_position`
    );
    console.log("cposList", cposList.data);
    this.cposList = [];
    cposList.data.forEach((item: any) => {
      this.cposList.push({ value: item.cposcode, label: item.cposname });
    });
    //单据列表
    let cvouchtypeRes = await this.SqlWork(
      "select",
      `select typecode,typename from wlzh_v_document`
    );
    console.log("ccusnameRes", cvouchtypeRes.data);
    this.cvouchtypeList = [];
    cvouchtypeRes.data.forEach((item: any) => {
      this.cvouchtypeList.push({ value: item.typecode, label: item.typename });
    });
    //部门列表
    let cdepNameRes = await this.SqlWork(
      "select",
      `select cdepcode,cdepname from wlzh_v_Department`
    );
    console.log("ccusnameRes", cdepNameRes.data);
    this.cdepNameList = [];
    cdepNameRes.data.forEach((item: any) => {
      this.cdepNameList.push({ value: item.cdepcode, label: item.cdepname });
    });
    //存货编码列表
    let crdnameRes = await this.SqlWork(
      "select",
      `
select crdcode,crdname from  wlzh_v_Rd_Style`
    );
    console.log("ccusnameRes", crdnameRes.data);
    this.crdnameList = [];
    crdnameRes.data.forEach((item: any) => {
      this.crdnameList.push({ value: item.crdcode, label: item.crdname });
    });
    if (database != null) this.SysInfo.database = database;
    else this.SysInfo.database = this.globalObject.database;

    if (cUserId != null) this.SysInfo.cUserId = cUserId;

    if (cVenCode != null) this.SysInfo.cVenCode = cVenCode;

    if (roles == null) roles = "";

    console.log("this.SysInfo.database", this.SysInfo.database);
    console.log("this.SysInfo.cUserId", this.SysInfo.cUserId);
    console.log("this.SysInfo.cVenCode", this.SysInfo.cVenCode);
    console.log("roles", roles);
    this.handle();

    if (roles.includes("admin")) this.SysInfo.cVenCode = "";

    // const loading = ElLoading.service({lock: true,text: 'Loading',background: 'rgba(0, 0, 0, 0.7)',})

    // let res=await this.SqlWork("select","wlzh_ly_getAsntemp '"+ this.SysInfo.cUserId+"' ");
    // this.bodyData=res.data.dataDetail;
    // console.log(res)
    // loading.close();
  },

  methods: {
    async SqlWork(CommandType: string, SqlsStr: string): Promise<any> {
      try {
        console.log(SqlsStr);
        const res = await axios.post(this.globalObject.ApiUrl, {
          CommandType: CommandType,
          database: this.SysInfo.database,
          SqlsStr: SqlsStr,
        });
        //console.log(res);
        //    this.tTable =res.data.dataDetail[0];
        //   console.log(this.tTable);
        return res;
      } catch (error) {
        console.error(error);
      }
    },
    async dialogVisibleClick() {
      let res1 = await this.SqlWork(
        "select",
        `select  * from wlzh_Dz_posDetail_field`
      );
      let res = await this.SqlWork(
        "select",
        "wlzh_PrintsettingLoad  '" +
          this.tname +
          "', '" +
          this.SysInfo.cUserId +
          "'"
      );
      let result = res1.data.filter((item: any) => {
        return (
          res.data.every((item1: any) => {
            return item.name != item1.field;
          }) && item.name != "selected"
        );
      });
      const CopypolistTableRef: any = this.$refs.multipleTableRef;
      const columns = CopypolistTableRef.columns;
      const list: any = [];
      result.forEach((item: any, index: any) => {
        list.push({
          sfxs: 0,
          sortid: res.data.length + 1 + index,
          name:
            this.headerData1.length === 0
              ? columns.find((value: any) => value.property === item.name)
                  ?.label || item.name
              : item.name,
          field: item.name,
          defaultname: item.name,
          width: "120",
        });
      });

      res.data.push(...list);
      this.headerData2 = res.data.sort(
        (a: any, b: any) => Number(a.sortid) - Number(b.sortid)
      );
      this.dialogVisible1 = true;
    },
    cinvcodeFocus() {
      this.dialogVisible = true;
    },
    determine() {
      this.handle();
      this.loadData();
      this.dialogVisible1 = false;
    },
    handleDaochu(command: string) {
      ElMessage(`click on item ${command}`);
    },

    async loadData() {
      try {
        console.log("this.filters.vouchDate", this.filters.vouchDate);
        //let res = await this.testSqlWork4()
        // const loading = ElLoading.service({lock: true,text: 'Loading',background: 'rgba(0, 0, 0, 0.7)',})
        //   const loading = ElLoading.service({
        //   lock: true,
        //   text: 'Loading',
        //   background: 'rgba(0, 0, 0, 0.7)',
        // })

        //this.fullscreenLoading = true;
        // const loading = ElLoading.service({ lock: true, text: 'Loading', background: 'rgba(0, 0, 0, 0.7)', })

        var filterStr = "  ";

        if (this.filters.cposcode) {
          filterStr +=
            (filterStr !== "  " ? "and " : "where ") +
            " cposcode= '" +
            this.filters.cposcode +
            "'";
        }

        if (this.filters.cposccode) {
          filterStr +=
            (filterStr !== "  " ? "and " : "where ") +
            "  cposccode = '" +
            this.filters.cposccode +
            "'";
        }

        if (this.filters.cinvstd) {
          filterStr +=
            (filterStr !== "  " ? "and " : "where ") +
            "  cinvstd= '" +
            this.filters.cinvstd +
            "'";
        }
        if (this.filters.cinvcode) {
          filterStr +=
            (filterStr !== "  " ? "and " : "where ") +
            "  cinvcode= '" +
            this.filters.cinvcode +
            "'";
        }
        if (this.filters.cinvname) {
          filterStr +=
            (filterStr !== "  " ? "and " : "where ") +
            "  cinvname= '" +
            this.filters.cinvname +
            "'";
        }
        if (this.filters.cbatch) {
          filterStr +=
            (filterStr !== "  " ? "and " : "where ") +
            "  cbatch= '" +
            this.filters.cbatch +
            "'";
        }
        let sql =
          filterStr !== "  "
            ? " select * from wlzh_v_dz_hwxcl " + filterStr
            : "select * from wlzh_v_dz_hwxcl";

        let res = await this.SqlWork("select", sql);

        console.log(res.data);
        this.bodyData = res.data;
        this.total_List = this.bodyData.length;
      } catch (error) {
        console.error(error);
      }
    },
    handleSizeChange_List(val: any) {
      //每次切换每页条数要把当前页设置为第一页
      this.pageNum_List = 1;
      this.pageSize_List = val;

      //this.fiterBodyData();
    },
    handleCurrentChange_List(val: any) {
      this.pageNum_List = val;
      //this.fiterBodyData();
    },

    bodyhandleSelectionChange(newSelection: never[]) {
      // this.multipleSelection = val;
      this.bodymultipleSelection = newSelection;
    },
    handleSelectionChange_List(newSelection: never[]) {
      // this.multipleSelection = val;
      this.multipleSelection_List = newSelection;
    },
    fiterBodyData_List(): any {
      //   if(this.bodyData)
      //   return   this.bodyData .slice((this.pageNum_List-1)*this.pageSize_List,this.pageNum_List*this.pageSize_List)
      // else
      var b = this.bodyData.filter((data) => 1 == 1);
      var r = b.slice(
        (this.pageNum_List - 1) * this.pageSize_List,
        this.pageNum_List * this.pageSize_List
      );

      return r;
    },
    // filterxjTableData(): any{
    // 		return this.bodyDataCopypolist_asn.filter((data) =>
    // 		      data.statue==statue
    // 		  )

    // },
    closeAsnvoucher() {
      this.dialogVisible = false;
    },

    async handle() {
      try {
        const database = sessionStorage.getItem("cDatabase");
        const cUserId = sessionStorage.getItem("username");
        const cVenCode = sessionStorage.getItem("cVenCode");
        var roles = sessionStorage.getItem("roles");
        console.log("database", database);
        console.log("cUserId", cUserId);
        if (database != null) this.SysInfo.database = database;
        else this.SysInfo.database = this.globalObject.database;

        if (cUserId != null) this.SysInfo.cUserId = cUserId;

        if (cVenCode != null) this.SysInfo.cVenCode = cVenCode;

        if (roles == null) roles = "";
        if (roles.includes("admin")) this.SysInfo.cVenCode = "";

        let res = await this.SqlWork(
          "select",
          "wlzh_PrintsettingLoad  '" +
            this.tname +
            "', '" +
            this.SysInfo.cUserId +
            "'"
        );
        const list: any[] = [];
        res.data.forEach((element: any) => {
          if (element.sfxs == 1) {
            list.push(element);
          }
        });
        this.headerData1 = list.sort(
          (a: any, b: any) => Number(a.sortid) - Number(b.sortid)
        );
        console.log(this.headerData1);
      } catch (error) {}
    },
    recognize(value: any) {
      this.filters.cinvcode = value.cinvname;
      this.dialogVisible = false;
    },
    // this.VouchID = row.id

    // this.dialogVisible = true
  },
  close() {
    this.dialogVisible = false;
  },
  isNumeric(char: any): boolean {
    // 正则表达式匹配数字，包括整数、浮点数以及正负号
    const numericPattern = /^[0-9]+(\.[0-9]*)?$/;
    // 如果是单个字符，先转换为字符串，然后匹配
    const charStr = String(char);
    // 判断是否匹配
    return numericPattern.test(charStr);
  },
};
</script>
<style lang="scss" scoped>
.el-row:last-child {
  margin-bottom: 0;
}

.el-col {
  border-radius: 4px;
  height: 48px;
}

:deep(.el-input--large) {
  height: 32px;
}

:deep(.el-select__wrapper) {
  height: 32px;
  min-height: 0;
}
:deep(.el-date-editor) {
  height: 32px;
  min-height: 0;
}

.grid-content {
  border-radius: 4px;
  min-height: 24x;
  margin-right: 20px;
}

.el-table .warning-row {
  --el-table-tr-bg-color: var(--el-color-warning-light-9);
}

.el-table .success-row {
  --el-table-tr-bg-color: var(--el-color-success-light-9);
}

.squantity-input {
  border: 1px solid #ccc;
  /* 这里可以定义边框的颜色和宽度 */
  padding: 0px;
  /* 内边距 */
  margin: 0px;
  border-radius: 4px;
  /* 圆角 */
  outline: none;
  /* 去除点击input时的默认边框 */
  font-size: 18px;
  width: 90%;
}
</style>
