import Vue from 'vue'
// 按需导入需要的组件
import {
    Button, Form, FormItem, Input, Message,
    Container, Header, Aside, Main, Menu, MenuItem,
    Submenu, Breadcrumb, BreadcrumbItem, Card, Row, Col,
    Table, TableColumn, Switch, Tooltip, Pagination, Dialog,
    MessageBox, Checkbox, Upload, CheckboxGroup, Tag, Tabs, TabPane, Tree, Select, Option, Cascader, Alert, Steps, Step
} from 'element-ui'


Vue.use(Upload)
Vue.use(Checkbox)
Vue.use(CheckboxGroup)
Vue.use(Steps)
Vue.use(Step)
Vue.use(TabPane)
Vue.use(Tabs)
Vue.use(Dialog)
Vue.use(Alert)
Vue.use(Cascader)
Vue.use(Select)
Vue.use(Option)
Vue.use(Tree)
Vue.use(Tag)
Vue.use(Button)
Vue.use(Pagination)
Vue.use(Tooltip)
Vue.use(Switch)
Vue.use(TableColumn)
Vue.use(Table)
Vue.use(Row)
Vue.use(Col)
Vue.use(Card)
Vue.use(Breadcrumb)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Container)
Vue.use(Header)
Vue.use(Aside)
Vue.use(Main)
Vue.use(Menu)
Vue.use(MenuItem)
Vue.use(Submenu)
Vue.use(BreadcrumbItem)

// 弹框使用比较特殊，需要将弹框组件挂载到Vue上，每一个组件都能使用
Vue.prototype.$message = Message
Vue.prototype.$confirm = MessageBox.confirm