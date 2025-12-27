export const cityData = [
  {
    name: "北京市",
    children: [
      { name: "市辖区", children: [{ name: "东城区" }, { name: "西城区" }, { name: "朝阳区" }, { name: "海淀区" }, { name: "丰台区" }, { name: "石景山区" }] }
    ]
  },
  {
    name: "天津市",
    children: [
      { name: "市辖区", children: [{ name: "和平区" }, { name: "河东区" }, { name: "河西区" }, { name: "南开区" }] }
    ]
  },
  {
    name: "上海市",
    children: [
      { name: "市辖区", children: [{ name: "黄浦区" }, { name: "徐汇区" }, { name: "长宁区" }, { name: "静安区" }, { name: "浦东新区" }] }
    ]
  },
  {
    name: "重庆市",
    children: [
      { name: "市辖区", children: [{ name: "渝中区" }, { name: "江北区" }, { name: "沙坪坝区" }, { name: "九龙坡区" }] }
    ]
  },
  {
    name: "浙江省",
    children: [
      { name: "杭州市", children: [{ name: "上城区" }, { name: "拱墅区" }, { name: "西湖区" }, { name: "滨江区" }] },
      { name: "宁波市", children: [{ name: "海曙区" }, { name: "江北区" }, { name: "北仑区" }] },
      { name: "温州市", children: [{ name: "鹿城区" }, { name: "龙湾区" }] }
    ]
  },
  {
    name: "江苏省",
    children: [
      { name: "南京市", children: [{ name: "玄武区" }, { name: "秦淮区" }, { name: "建邺区" }, { name: "鼓楼区" }] },
      { name: "苏州市", children: [{ name: "姑苏区" }, { name: "虎丘区" }, { name: "吴中区" }] }
    ]
  },
  {
    name: "广东省",
    children: [
      { name: "广州市", children: [{ name: "越秀区" }, { name: "海珠区" }, { name: "天河区" }, { name: "白云区" }] },
      { name: "深圳市", children: [{ name: "罗湖区" }, { name: "福田区" }, { name: "南山区" }, { name: "宝安区" }] }
    ]
  },
  {
    name: "四川省",
    children: [
      { name: "成都市", children: [{ name: "锦江区" }, { name: "青羊区" }, { name: "金牛区" }, { name: "武侯区" }] }
    ]
  },
  {
    name: "湖北省",
    children: [
      { name: "武汉市", children: [{ name: "江岸区" }, { name: "江汉区" }, { name: "硚口区" }, { name: "武昌区" }] }
    ]
  },
  {
    name: "陕西省",
    children: [
      { name: "西安市", children: [{ name: "新城区" }, { name: "碑林区" }, { name: "莲湖区" }, { name: "雁塔区" }] }
    ]
  }
];

export const getCoordinates = (province, city, district) => {
  const coords = {
    "北京市": [39.9042, 116.4074],
    "天津市": [39.0842, 117.2009],
    "上海市": [31.2304, 121.4737],
    "重庆市": [29.5630, 106.5516],
    "杭州市": [30.2741, 120.1551],
    "宁波市": [29.8683, 121.5440],
    "南京市": [32.0603, 118.7969],
    "苏州市": [31.2989, 120.5853],
    "广州市": [23.1291, 113.2644],
    "深圳市": [22.5431, 114.0579],
    "成都市": [30.5728, 104.0668],
    "武汉市": [30.5928, 114.3055],
    "西安市": [34.3416, 108.9398]
  };

  // If city is found, return city coords, else return province default (approx)
  // For simplicity, we just check city first, then province
  if (coords[city]) return coords[city];
  
  // Province defaults
  const provCoords = {
    "浙江省": [30.2741, 120.1551],
    "江苏省": [32.0603, 118.7969],
    "广东省": [23.1291, 113.2644],
    "四川省": [30.5728, 104.0668],
    "湖北省": [30.5928, 114.3055],
    "陕西省": [34.3416, 108.9398]
  };

  return provCoords[province] || [39.9042, 116.4074];
};
