import service from '@@/service/report';
import store from '@@/store';

const getReportsConfigTree = async () => {
  return service.getReportsConfigTree();
}

let file = null;
const getFileName = () => {
  file = null;
  store.commit('setUploadReportName', '')
  const input = document.createElement('input')
  input.accept = '.mrt'
  input.type = 'file'
  input.onchange = () => {
    const fileData = input.files[0];
    file = fileData;
    store.commit('setUploadReportName', fileData.name)
  }
  input.click()
}

const creatReportsConfig = async (name, classification) => {
  if (file) {
    if (!name) {
      alert(i18n.getTrans('dialog', 'Please enter the report name'));
      return;
    }
    if (!classification) {
      alert(i18n.getTrans('dialog', 'Please select report grouping'));
      return;
    }

    const form = new FormData()
    form.append('File', file)
    form.append('name', name)
    form.append('classification', classification)
    return await service.creatReportsConfig(form);
  }
}

// 获取所有报表信息
const getReportsConfig = async () => {
  return service.getReportsConfig();
}
// 修改分组名
const editReportsConfigClassification = async (id, body) => {
  return service.editReportsConfigClassification(id, body);
}

// 删除报表分组
const deleteReportsConfigClassification = async (id) => {
  return service.deleteReportsConfigClassification(id);
}

// 查询报表分类列表
const getReportsConfigClassification = async () => {
  return service.getReportsConfigClassification();
}

// 修改报表名字
const editReportsConfig = async (id, body) => {
  const form = new FormData()
  form.append('File', file)
  form.append('name', body.name)
  form.append('classification', body.type)
  return service.editReportsConfig(id, form);
}

// 新增报表分类
const creatReportsConfigClassification = async (body) => {
  return service.creatReportsConfigClassification(body);
}

// 根据报表名查询文件名
const getReportsConfigByName = async (name) => {
  return service.getReportsConfigByName(name);
}

const deleteReportById = async (id) => {
  return service.deleteReportById(id);
}

export default {
  getReportsConfigTree,
  creatReportsConfig,
  getReportsConfig,
  editReportsConfigClassification,
  deleteReportsConfigClassification,
  getReportsConfigClassification,
  editReportsConfig,
  creatReportsConfigClassification,
  getReportsConfigByName,
  getFileName,
  deleteReportById
}
