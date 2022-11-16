import * as THREE from "three";

export namespace CadBaseInfoNs {
  export enum CadGraphicType {
    ARC = "AcDbArc",
    /** 属性定义对象 */
    ATTRIBUTE_DEFINITION = "AcDbAttributeDefinition",
    /** 属性定义对象引用 */
    ATTRIBUTE_REFERENCE = "AcDbAttribute",
    /** 块的引用 */
    BLOCK_REFERENCE = "AcDbBlockReference",
    /** 圆 */
    CIRCLE = "AcDbCircle",
    /** 椭圆 */
    ELLIPSE = "AcDbEllipse",
    /** 填充图案 */
    HATCH = "AcDbHatch",
    /** 引线 */
    LEADER = "AcDbLeader",
    /** 直线 */
    LINE = "AcDbLine",
    /** 多线图元 */
    M_LINE = "AcDbMLine",
    /** 文字内容 */
    M_TEXT = "AcDbMText",
    /** 折线 */
    POLYLINE = "AcDbPolyline",
    /** 3维实体 */
    SOLID = "AcDbSolid",
    /** 样条曲线 */
    SPLINE = "AcDbSpline",
    /** 单行文本 */
    TEXT = "AcDbText",
    /** 视口 */
    VIEWPORT = "AcDbViewport",
    /** 注解 */
    DIMENSION = "AcDbDimension",
    /** 对齐标注 */
    ALIGNED_DIMENSION = "AcDbAlignedDimension",
    /** 弧形标注 */
    ARC_DIMENSION = "AcDbArcDimension",
    /** 直径标注 */
    DIAMETRIC_DIMENSION = "AcDbDiametricDimension",
    /** 径向标注 */
    RADIAL_DIMENSION = "AcDbRadialDimension",
    /** 径向标注=大 */
    RADIAL_DIMENSION_LARGE = "AcDbRadialDimensionLarge",
    /** 旋转标注 */
    ROTATED_DIMENSION = "AcDbRotatedDimension",
    /** 旋转标注 */
    ANGULAR_DIMENSION = "AcDbAngularDimension",
    /** 三点角度标注 */
    LINE_ANGULAR_DIMENSION = "LINE_ANGULAR_DIMENSION",
    /** 表格 */
    TABLE = "AcDbTable",
    /** 多重引线 */
    M_LEADER = "AcDbMLeader",
    /** 默认图元类型 */
    DEFAULT = "default",
  }

  export enum CadFullRecognizeEntityType {
    unknown = "unknown",

    AcDbDimensionEntityItem = "AcDbDimensionEntityItem",
    AcDbDimensionEntityGroup = "AcDbDimensionEntityGroup",
    AcDbRecognizeEntityItem = "AcDbRecognizeEntityItem",
    AcDbRecognizeEntityGroup = "AcDbRecognizeEntityGroup",
    AcDbIsolatedEntityGroup = "AcDbIsolatedEntityGroup",
    AcDbFullRecognize = "AcDbFullRecognize",

    AcDbClassifyLayer = "AcDbClassifyLayer",
    AcDbClassification = "AcDbClassification",
  }

  export type Coordinate = [number, number, number];

  // 基础类型
  export interface BaseCad {
    /** 唯一标识 */
    handle: string;
    /** 类型名 */
    entityType: string;
  }

  export interface Entity extends BaseCad {
    /** 线型比例 */
    linetypeScale: number;
    /** 图元类型 */
    entityType: CadGraphicType;
    /** 扩展数据字典表 */
    xdata: string;
    /** 图层名，对应layerTable列表中一个同名的Layer */
    layerName: string;
    // entity所在的block，以及他的父block列表
    blockNames: string[];
    color: string;
    /** 线型名，对应linetypeTable列表中一个同名的Linetype */
    linetypeName: string;
    /**
     * 线宽
     *
     * <p>BYBLOCK表示与所属的BlockReference的line_weight一致；
     *
     * <p>BYLAYER表示与图层line_weight一致
     */
    lineWeight: string;
    /** 水平矩形包围盒的对角点(左下) */
    envelopeLeftDownPoint: Coordinate;
    /** 水平矩形包围盒的对角点(右上) */
    envelopeRightUpPoint: Coordinate;
  }
}

export namespace CadRawEntityAttributeNs {
  export interface textStyle {
    // /** 名称 */
    name: string;
    // /** 字体名 */
    fileName: string;
    // /** 大字体名，.shx文件名，当is_shape_file为true时才有值 */
    bigFontName: string;
    // /** 文字高度 */
    textSize: number;
    // /** 默认文字高度 */
    priorSize: number;
    // /** 文字宽度因子，以text_size为基数 */
    xscale: number;
    // /** 倾斜角度 */
    obliquingAngle: number;
    // /** 是否反向绘制（即以 X 轴镜像） */
    xMirrored: boolean;
    // /** 是否颠倒绘制（即以Y轴镜像） */
    yMirrored: boolean;
    // /** 是否垂直绘制 */;
    vertical: boolean;
    // /** 是否.shx字体 */
    shapeFile: boolean;
    // /** ttf字体名，当is_shape_file为false时才有值 */
    ttfName: string;
  }

  export interface LinetypeDashe {
    /** 长度 */
    length: number;

    /** 文本字符串 */
    text: string;

    /** 嵌入的图形字体样式名称，对应textStyleTable列表中一个同名的TextStyle */
    textStyleName: string;

    /** 形状编号 */
    shapeNumber: number;

    /** 偏移向量 */
    shapeOffset: CadBaseInfoNs.Coordinate;

    /** 旋转角度（以弧度为单位） */
    shapeRotation: number;

    /** 比例 */
    shapeScale: number;

    /**
     * 如果为true，则图形将在显示时相对当前UCS定向，
     *
     * <p>如果为false，则图形将相对于它嵌入的线进行定向
     */
    shapeOriented: boolean;
  }

  export interface DimStyle extends CadBaseInfoNs.BaseCad {
    /** 名称 */
    name: string;

    /** 文字样式名，对应Database.text_style_table列表中一个同名的TextStyle */
    dimtxstyName: string;

    /** 文字高度 */
    dimtxt: number;

    /** 箭头大小 */
    dimasz: number;

    /** 尺寸界线的起点偏移量 */
    dimexo: number;

    /** 尺寸界线的超出量 */
    dimexe: number;

    /** 尺寸基线间距 */
    dimdli: number;

    /** 第一根尺寸界线的线型名，对应Database.linetype_table列表中一个同名的Linetype */
    dimltex1: string;

    /** 第二根尺寸界线的线型名，对应Database.linetype_table列表中一个同名的Linetype */
    dimltex2: string;

    /**
     * 尺寸基线颜色（RGB格式）
     *
     * <p>BYBLOCK表示与所属的BlockReference的颜色一致；
     *
     * <p>BYLAYER表示与图层颜色一致
     */
    dimclrd: string;

    /**
     * 尺寸界线颜色（RGB格式）
     *
     * <p>BYBLOCK表示与所属的BlockReference的颜色一致；
     *
     * <p>BYLAYER表示与图层颜色一致
     */
    dimclre: string;

    /** 第一个箭头的类型名，对应Database.block_table列表中一个同名的Block */
    dimblk1: string;

    /** 第二个箭头的类型名，对应Database.block_table列表中一个同名的Block */
    dimblk2: string;

    /** 统一的箭头的类型名，对应Database.block_table列表中一个同名的Block */
    dimblk: string;

    /** 尺寸线1开关 默认true */
    dimsd1: boolean;

    /** 尺寸线2开关 默认true */
    dimsd2: boolean;

    /** 尺寸线范围 */
    dimdle: number;

    /** 尺寸界线1开关 默认true */
    dimse1: boolean;

    /** 尺寸界线2开关 默认true */
    dimse2: boolean;

    /** 固定的尺寸界线开关 默认false */
    dimfxlenOn: boolean;

    /** 固定的尺寸界线长度 默认0 */
    dimfxlen: number;

    /** 文字偏移 */
    dimgap: number;

    /** 文字界外对齐 默认false */
    dimtoh: boolean;

    /** 水平放置文字 置中=0 第一条尺寸界线=1 第二条尺寸界线=2 第一条尺寸界线上方=3 第二尺寸线上方=4 */
    dimjust: number;

    /** 垂直放置文字 居中=0 上方=1 外部=2 JIS=3 下方=4 */
    dimtad: number;

    /** 文字界内对齐开关 默认false */
    dimtih: boolean;

    /** 控制对主单位值中零的抑制，支持位运算。 消去前导零=4 消去后续零=8 */
    dimzin: number;

    /** 主单位-标注单位 默认2 科学=1 小数=2 工程=3 建筑=4 分数=5 */
    dimlunit: number;

    /** 主单位-精度 只支持数字0-8，各数字代表显示的小数位 */
    dimdec: number;

    /** 主单位-小数分隔符 */
    dimdsep: string;
  }

  export interface TextStyle {
    /** 名称 */
    name: string;

    /** 字体名 */
    fileName: string;

    /** 大字体名，.shx文件名，当is_shape_file为true时才有值 */
    bigFontName: string;

    /** 文字高度 */
    textSize: number;

    /** 默认文字高度 */
    priorSize: number;

    /** 文字宽度因子，以text_size为基数 */
    xscale: number;

    /** 倾斜角度 */
    obliquingAngle: number;

    /** 是否反向绘制（即以 X 轴镜像） */
    xMirrored: boolean;

    /** 是否颠倒绘制（即以Y轴镜像） */
    yMirrored: boolean;

    /** 是否垂直绘制 */
    vertical: boolean;

    /** 是否.shx字体 */
    shapeFile: boolean;

    /** ttf字体名，当is_shape_file为false时才有值 */
    ttfName: string;
  }

  export interface AttributeReference extends TextStyle {
    tag: string;
  }

  export interface AttributeDefinition extends TextStyle {
    /** 标记字符串 */
    tag: string;

    /** 提示文本 */
    prompt: string;

    /** 是否锁定与块的相对位置 */
    lockPosition: boolean;
  }
}

export namespace CadRawEntityNs {
  export enum TextAlignMode {
    TopLeft = 1,
    TopCenter = 2,
    TopRight = 3,
    MiddleLeft = 4,
    MiddleCenter = 5,
    MiddleRight = 6,
    BottomLeft = 7,
    BottomCenter = 8,
    BottomRight = 9,
    BaseLeft = 10,
    BaseCenter = 11,
    BaseRight = 12,
    BaseAlign = 13,
    BaseFit = 17, // 布满
    BaseMid = 21, // 布满
  }

  export interface Block extends CadBaseInfoNs.BaseCad {
    // 名称
    name: string;
    // 扩展数据字典表
    xdata: string;
    // 空间名称
    layoutName: string;
    // 图元集合
    entities: CadBaseInfoNs.Entity[];
    // 基准点模式，1=居中 2=左下
    positionMode: number;
  }

  export interface Layout extends CadBaseInfoNs.BaseCad {
    /** 名称,若此layout为 图元空间（即block的entities不为空，则name = Model） */
    name: string;
    /** 布局栏的标签是否选中 */
    tabSelected: boolean;
    /** 布局栏的标签序号 */
    tabOrder: number;
    blockName: string;
    block: Block;
    ucsOrigin: CadBaseInfoNs.Coordinate;
    ucsXAxis: CadBaseInfoNs.Coordinate;
    ucsYAxis: CadBaseInfoNs.Coordinate;
  }

  export interface Linetype extends CadBaseInfoNs.BaseCad {
    /** 名称 */
    name: string;

    /** 与线型定义文件相同的简单ASCII格式的描述信息 */
    comments: string;

    /** 是否自适应缩放 */
    isScaledToFit: boolean;

    /**
     * 单位图案长度，当图元的线型比例为1.0时，图元图案将以此图案长度进行显示。
     *
     * <p>图案长度是所有破折号（包括空格）的总长度。
     *
     * <p>嵌入的形状或文本字符串不会增加图案长度，因为它们是重叠的并且不会中断实际的虚线图案。
     */
    patternLength: number;

    /** 破折号集合 */
    dashes: CadRawEntityAttributeNs.LinetypeDashe[];
  }

  export interface BlockReference extends CadBaseInfoNs.Entity {
    /** 块名，对应Database.block_table列表中一个同名的Block */
    name: string;

    /** 插入点 */
    position: number[];

    /** 旋转角度（以弧度为单位） */
    rotation: number;

    /** x轴缩放比例 */
    scaleX: number;

    /** y轴缩放比例 */
    scaleY: number;

    /** 是否启用裁剪 */
    clipEnabled: boolean;

    /** 裁剪区域端点集合 */
    clipPoints: number[][];

    /** 是否反转裁剪区域 */
    clipInverted: boolean;

    /** 块属性集合 */
    attributes: CadRawEntityAttributeNs.AttributeReference;

    /** 是否支持天正旧图转换 */
    supportTangent: boolean;
  }

  export interface DBText extends CadBaseInfoNs.Entity {
    text: string;
    fontHeight: number;
    textStyleName: string;
    rotation: number;
    position: number[];
    alignmentPoint: number[];
    alignmentMode: TextAlignMode;
    widthFactor: number;
    oblique: number; // 倾斜角度（以弧度为单位）
    xMirrored: boolean;
    yMirrored: boolean;
  }

  export interface MText extends CadBaseInfoNs.Entity {
    /** 不包含格式的文本内容 */ text: string;

    /** 含格式的文本内容 */
    contents: string;

    /** 文字高度 */
    fontHeight: number;

    /** 旋转角度（以弧度为单位） */
    rotation: number;

    /**
     * 对齐方式
     *
     * <p>TopLeft(左上)=1
     *
     * <p>TopCenter(中上)=2
     *
     * <p>TopRight(右上)=3
     *
     * <p>MiddleLeft(左中)=4
     *
     * <p>MiddleCenter(正中)=5
     *
     * <p>MiddleRight(右中)=6
     *
     * <p>BottomLeft(左下)=7
     *
     * <p>BottomCenter(中下)=8
     *
     * <p>BottomRight(右下)=9
     */
    alignmentMode: number;

    /** 字体样式，对应textStyleTable列表中一个同名的TextStyle */
    textStyleName: string;

    /**
     * 文字方向
     *
     * <p>LeftToRight=1
     *
     * <p>RightToLeft=2
     *
     * <p>TopToBottom=3
     *
     * <p>BottomToTop=4
     *
     * <p>ByStyle=5
     */
    flowDirection: number;

    /** 用于自动换行格式的最大宽度 */
    width: number;

    /** 插入点坐标 */
    location: CadBaseInfoNs.Coordinate;

    /** 行间距,fontHeight * 1.6667 */
    lsDistance: number;

    /** 行距比例 */
    lsFactor: number;
  }

  export interface Circle extends CadBaseInfoNs.Entity {
    /** 圆心坐标 */
    center: CadBaseInfoNs.Coordinate;

    /** 半径 */
    radius: number;

    /** 圆的形状 */
    shape: string;
  }

  export interface Arc extends CadBaseInfoNs.Entity {
    /** 圆心坐标 */
    center: CadBaseInfoNs.Coordinate;

    /** 半径 */
    radius: number;
    /** 起始角度（以弧度为单位） */
    startAngle: number;

    /** 结尾角度（以弧度为单位） */
    endAngle: number;

    /** 旋转方向，true为顺时针，false为逆时针 */
    isClockWise: boolean;
  }

  export interface Line extends CadBaseInfoNs.Entity {
    /** 起点坐标 */
    startPoint: number[];

    /** 终点坐标 */
    endPoint: number[];
  }

  export interface Ellipse extends CadBaseInfoNs.Entity {
    /** 圆心坐标 */
    center: number[];

    /** 长轴向量 */
    majorAxis: number[];

    /** 大半径与小半径的比例，不能大于1 */
    radiusRatio: number;

    /** 起始角度（以弧度为单位） */
    startAngle: number;

    /** 结尾角度（以弧度为单位） */
    endAngle: number;

    /** 旋转方向，true为顺时针，false为逆时针 */
    isClockWise: boolean;

    /** 图形点坐标集合 */
    geomPoints: number[][];
  }

  export interface Mline extends CadBaseInfoNs.Entity {
    /** 端点坐标集合 */
    points: number[][];

    /**
     * 对齐方式
     *
     * <p>Top=0 Zero=1 Bottom=2
     */
    justification: number;

    /** 两线间的宽度，如果是0则折叠为一条线 */
    scale: number;

    /** 是否闭合 */
    isClosed: boolean;

    /** 组成的线段集合 */
    explodeLines: Line[];
  }

  export interface Spline extends CadBaseInfoNs.Entity {
    /** 控制点坐标集合 */
    points: number[][];

    /** 节点值集合 */
    knots: number[];

    /** 是否闭合 */
    closed: boolean;

    /** 控制点容差 */
    ctrlPointTol: number;

    /** 节点容差 */
    knotTol: number;

    /** 是否是周期性 */
    periodic: boolean;

    /** 是否合理 */
    rational: boolean;

    /** 曲线阶数 */
    degree: number;

    /** 图形点坐标集合 */
    geomPoints: number[][];
  }

  export interface Solid extends CadBaseInfoNs.Entity {
    /** 端点坐标集合 */
    points: number[][];
  }

  export interface Leader extends CadBaseInfoNs.Entity {
    /** 端点坐标集合 */
    points: number[][];

    /** 是否样条曲线 */
    isSplined: boolean;

    /** 是否启用箭头 */
    hasArrowHead: boolean;

    /** 箭头大小 */
    dimasz: number;

    /**
     * 颜色（RGB格式）
     *
     * <p>BYBLOCK表示与所属的BlockReference的颜色一致；
     *
     * <p>BYLAYER表示与图层颜色一致
     *
     * <p>byaci表示与背景色相反，比如背景色为纯白#FFFFFF，则byaci为黑色#000000
     */
    dimclrd: string;

    /** 组合图元集合 */
    explodeEntities: CadBaseInfoNs.Entity[];

    /** 关联图元的handle */
    annotationHandle: string;

    /** 文字偏移，文字与引线的垂直距离 */
    dimgap: number;

    /** 控制文本相对于尺寸线的垂直位置，0=居中 1=引线上方 2=外部 3=JIT 4=下方 */
    dimtad: number;
  }

  export interface MLeader extends CadBaseInfoNs.Entity {
    /** 内容类型 0=无 1=块 2=文本 */
    contentType: number;

    /** 引线集合 */
    leaderLines: LeaderLine[];

    /** 控制引线延伸开关 */
    extendLeader: boolean;

    /** 引线与内容的附着方式 如果是内容为文本图元则 0=水平 1=垂直，反之内容是块图元，则0=中心范围 1=块插入点 */
    attachmentType: number;

    /** 箭头大小 */
    arrowSize: number;

    /** 箭头样式，对应blockTable内的同名对象 */
    arrowSymbol: string;

    /** 水平基线开关 */
    enableDogleg: boolean;

    /** 基线与内容的间距 */
    landingGap: number;

    /** 引线线宽 */
    leaderLineWeight: string;

    /** 引线线型 对应linetypeTable中的同名对象 */
    leaderLinetypeName: string;

    /** 引线颜色 */
    leaderLineColor: string;

    /** 引线类型 0=无 1=直线 2=样条曲线 */
    leaderType: number;

    /** 左侧引线附着方式 0=第一行顶部 1=第一行中间 2=文字中间 3=最后一行中间 4=最后一行底部 5=最后一行加下划线 6=第一行底部加下划线 7=第一行底部 8=所有文字加下划线 */
    leftLeaderDirection: number;

    /** 右侧引线附着方式 0=第一行顶部 1=第一行中间 2=文字中间 3=最后一行中间 4=最后一行底部 5=最后一行加下划线 6=第一行底部加下划线 7=第一行底部 8=所有文字加下划线 */
    rightLeaderDirection: number;

    /** 顶部引线附着方式 9=居中 10=上划线并居中 */
    topLeaderDirection: number;

    /** 底部引线附着方式 9=居中 10=上划线并居中 */
    bottomLeaderDirection: number;

    /** 内容图元 */
    content: CadBaseInfoNs.Entity;

    /** 组合图元集合 */
    explodeEntities: CadBaseInfoNs.Entity[];
  }

  export interface LeaderLine {
    /** 引线连接点 */
    connectionPoint: number[];

    /** 引线段端点集合 */
    verticesArray: number[][][];

    /** 延长线端点 */
    doglegPoint: number[];
  }

  export interface Viewport extends CadBaseInfoNs.Entity {
    /** 中心点 */
    centerPoint: number[];

    /** 从视图目标到视图相机的法向量 */
    viewDirection: number[];

    /** 关联的图元handle */
    clipEntityHandle: string;

    /** 冻结的图层名集合 */
    frozenLayerNames: string[];

    /** 宽度 */
    width: number;

    /** 映射的模型空间区域高度 */
    viewHeight: number;

    /** 映射的视图中心点 */
    viewCenter: number[];

    /** 是否 UCS 更改时生成并显示平面视图 */
    ucsFollowModeOn: boolean;

    /** 是否启用非矩形裁剪 */
    clipOn: boolean;

    /** 是否将活动状态的视口与UCS关联 */
    ucsPerViewport: boolean;

    /** 用户坐标系 */
    ucs: number[];

    /** 缩放比例 */
    customScale: number;

    /** 视口是否锁定 */
    locked: boolean;

    /** 视图的扭曲角度（以弧度为单位） */
    twistAngle: number;

    /** 视图目标的位置 */
    viewTarget: number[];

    /** 透视模式下的镜头长度 */
    lensLength: number;

    /** 高度 */
    height: number;
  }

  export interface Polyline extends CadBaseInfoNs.Entity {
    /** 是否闭合 */
    closed: boolean;

    /** 是否只有直线组成 */
    isOnlyLines: boolean;

    /** 端点坐标集合 */
    bulgeVertices: BulgeVertex[];

    /** 图形点坐标集合 */
    geomPoints: number[][];

    /** 组合图元集合 */
    explodeEntities: CadBaseInfoNs.Entity[];
  }

  export interface BulgeVertex {
    /** 坐标点 */
    point: number[];

    /** 圆弧凸度，如果非零则表示为圆弧线段，如果是零则表示直线段 */
    bulge: number;

    /** 起始线段的宽度 */
    startWidth: number;

    /** 终止线段的宽度 */
    endWidth: number;
  }
  export interface Hatch extends CadBaseInfoNs.Entity {
    /** 图案来源类型 UserDefined（用户定义）=0 PreDefined（预定义）=1 CustomDefined（自定义）=2 */
    patternType: number;

    /** 图案名 */
    patternName: string;

    /** 图案缩放比例 */
    patternScale: number;

    /** 图案旋转角度（以弧度为单位） */
    patternAngle: number;

    /** 图案孤岛检测样式 Normal（普通）=0 Outer（外部）=1 Ignore（忽略）=2 */
    hatchStyle: number;

    /** 背景色（RGB格式） */
    background: string;

    /** 填充的线条集合 */
    hatchLines: Line[];

    /** 闭合区域集合 */
    hatchLoops: HatchLoop[];
  }

  export enum HatchLoopType {
    Default = 0,
    // （由多个entity构成的闭合区域）
    External = 1,
    // （闭合多段线构成的区域）
    Polyline = 2,
    // （由点构成的闭合区域）
    Derived = 4,
    // （由文本对象组成的区域）
    Textbox = 8,
    // （外部区域）
    Outermost = 16,
    // （非闭合区域)
    NotClosed = 32,
    // （与自身相交的循环）
    SelfIntersecting = 64,
    // （文本孤岛）
    TextIsland = 128,
  }

  export interface HatchLoop {
    loopType: HatchLoopType;

    /** 线图元集合,只能是line或arc */
    curves: CadBaseInfoNs.Entity[];

    /** 图形点坐标集合 */
    geomPoints: number[][];
  }

  export interface Dimension extends CadBaseInfoNs.Entity {
    /** 组成的图元集合 */
    explodeEntities: CadBaseInfoNs.Entity[];

    /** 文本内容 */
    dimText: string;

    /** 标注样式名，对应Database.dim_style_table列表中一个同名的DimStyle */
    dimStyleName: string;

    /** 文字样式，对应Database.text_style_table列表中一个同名的TextStyle */
    textStyle: string;

    /** 文字旋转（单位为弧度） */
    textRotation: number;
  }

  export interface ArcDimension extends Dimension {
    /** 圆心点坐标 */
    center: number[];

    /** 第一条边界线的端点坐标 */
    line1Point: number[];

    /** 第二条边界线的端点坐标 */
    line2Point: number[];

    /** 圆弧线上的点坐标 */
    arcPoint: number[];
  }

  // 折弯
  export interface RadialDimensionLarge extends Dimension {
    /** 圆心点坐标 */
    center: number[];

    /** 选中的圆弧点坐标 */
    chordPoint: number[];

    /** 覆盖中心点坐标 */
    overrideCenter: number[];

    /** 折弯点坐标 */
    jogPoint: number[];

    /** 折弯角度（以弧度为单位） */
    jogAngle: number;
  }

  export interface AlignedDimension extends Dimension {
    /** 第一条边界线的端点坐标 */
    line1Point: number[];

    /** 第二条边界线的端点坐标 */
    line2Point: number[];

    /** 引线端点坐标 */
    dimlinePoint: number[];
  }

  // 转角
  export interface RotatedDimension extends Dimension {
    /** 第一条边界线的端点坐标 */
    line1Point: number[];

    /** 第二条边界线的端点坐标 */
    line2Point: number[];

    /** 引线端点坐标 */
    dimlinePoint: number[];

    /** 选中角度（以弧度为单位） */
    rotation: number;
  }

  // 直径
  export interface DiametricDimension extends Dimension {
    /** 弧线上的点坐标 */
    chordPoint: number[];

    /** 对称圆弧上的点坐标 */
    farChordPoint: number[];

    /** 引线长度 */
    leaderLength: number;
  }

  // 半径
  export interface RadialDimension extends Dimension {
    /** 圆心坐标 */
    center: number[];

    /** 选中的弧线上的点坐标 */
    chordPoint: number[];

    /** 引线长度 */
    leaderength: number;
  }

  // 三点角度
  export interface AngularDimension extends Dimension {
    center: number[]; //	圆心点坐标
    line1Point: number[]; //	第一条边界线的端点坐标
    line2Point: number[]; //	第二条边界线的端点坐标
    arcPoint: number[]; //	圆弧线上的点坐标
  }

  // 角度
  export interface LineAngularDimension extends Dimension {
    line1Start: number[]; //	第一条线的起点
    line1End: number[]; // 第一条线的终点
    line2Start: number[]; // 第二条线的起点
    line2End: number[]; // 第二条线的终点
    arcPoint: number[]; // 标注圆弧的位置点
  }

  export interface Table extends CadBaseInfoNs.Entity {
    /** 块名，对应Database.block_table列表中一个同名的Block */
    name: string;

    /** 插入点 */
    position: number[];

    /** 行数 */
    rowNum: number;

    /** 列数 */
    columnNum: number;

    /** 统一行高 */
    rowHeight: number;

    /** 自定义每行高度 */
    rowHeights: number[];

    /** 统一列宽 */
    columnWidth: number;

    /** 自定义每列宽度 */
    columnWidths: number[];

    /** 单元格列表 */
    cells: Cell[];

    /** 组合图元集合 */
    explodeEntities: CadBaseInfoNs.Entity[];
  }

  export interface Cell {
    /** 行号 */
    row: number;

    /** 列号 */
    column: number;

    /** 文字内容 */
    content: string;

    /** 文字高度 */
    textHeight: number;

    /**
     * 文字对齐方式 TopLeft = 1, TopCenter = 2, TopRight = 3, MiddleLeft = 4, MiddleCenter = 5, MiddleRight
     * = 6, BottomLeft = 7, BottomCenter = 8, BottomRight = 9
     */
    alignment: number;

    /** 合并单元格的区域 左上和右下单元格的行号与列号 [topRow,leftColumn,bottomRow,rightColumn] */
    mergeRange: number[];

    /** 单元格内边距，顺序左上右下[left,top,right,bottom] */
    margin: number[];
  }
}

function snakeCaseToCamelCase(s: string): string {
  return s.replace(/(\_\w)/g, (m) => m[1].toUpperCase());
}

function convertKeysToCamelCase(o: any): any {
  if (Array.isArray(o)) {
    return o.map((item: any) => convertKeysToCamelCase(item));
  }
  if (typeof o === "object" && o !== null) {
    const result: Record<string, any> = {};
    Object.keys(o).forEach((key) => {
      result[snakeCaseToCamelCase(key)] = convertKeysToCamelCase(o[key]);
    });
    return result;
  }
  return o;
}

export async function getRawEntities(): Promise<CadBaseInfoNs.Entity[]> {
  const res = await fetch(
    "https://dev-xkoolwebsite.oss-cn-shenzhen.aliyuncs.com/new-cad-parser/2022-11-16/1-1单元20_33层_1-2单元屋顶层平面图/a6cda0c071e64b75b8c7ef7f14754878_1-1单元20_33层_1-2单元屋顶层平面图_cad_raw_entities.json"
  );
  const data = await res.json();

  return convertKeysToCamelCase(data) as CadBaseInfoNs.Entity[];
}

export function CadView(list: CadBaseInfoNs.Entity[]) {
  const bound = new THREE.Box3();
  const meshes: THREE.Object3D[] = [];
  list.forEach((item) => {
    switch (item.entityType) {
      case CadBaseInfoNs.CadGraphicType.LINE: {
        const eitem = item as CadRawEntityNs.Line;
        const geometry = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(eitem.startPoint[0], eitem.startPoint[1], 0),
          new THREE.Vector3(eitem.endPoint[0], eitem.endPoint[1], 0),
        ]);
        const line = new THREE.Line(
          geometry,
          new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 2,
          })
        );
        bound.expandByObject(line);
        meshes.push(line);
        break;
      }
    }
  });
  console.log(bound.getSize(new THREE.Vector3()), "bound");
  const center = bound.getCenter(new THREE.Vector3());
  meshes.forEach((object) => {
    const oposition = object.position.clone();
    object.position.set(
      oposition.x - center.x,
      oposition.y - center.y,
      oposition.z - center.z
    );
  });

  return meshes;
}

export async function drawCadViewFlow() {
  const list = await getRawEntities();
  console.log(list, "list");
  const meshes = CadView(list);
  console.log(meshes, "meshes");
  return meshes;
}
