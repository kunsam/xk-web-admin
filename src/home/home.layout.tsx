import { PropsWithChildren, useEffect, useRef } from "react";
import styles from "./index.module.css";
import { useWater } from "./water.effect";
import * as THREE from "three";
import { Text, preloadFont } from "troika-three-text";
import { GLTFLoader } from "./objects/gltf.loader";
import Router from "next/router";
import { drawCadViewFlow } from "./drawCad";

interface LinkItem {
  env: string;
  link: string;
}

interface CategoryItem {
  category: string;
  list: LinkItem[];
  videoUrl?: string;
  imgUrl?: string;
  link?: string;
}

const List: CategoryItem[] = [
  {
    category: "设计云",
    videoUrl: "videobg.mp4",
    list: [
      {
        env: "dev",
        link: "https://dev.xkool.org/",
      },
      {
        env: "test",
        link: "https://test.xkool.org/",
      },
      {
        env: "prod",
        link: "https://www.xkool.ai/",
      },
    ],
  },
  {
    category: "审图",
    imgUrl: "/bc_banner.ff70d249.png",
    list: [
      {
        env: "dev",
        link: "https://reviewdev.xkool.org/koolreview",
      },
      {
        env: "test",
        link: "https://reviewtest.xkool.org/koolreview",
      },
      {
        env: "prod",
        link: "https://review.xkool.org/koolreview",
      },
    ],
  },
  {
    category: "单体",
    videoUrl: "/bc_1_1.mp4",
    list: [
      {
        env: "dev",
        link: "https://dev.xkool.org/koolplan/project/3086?entityId=4947",
      },
      {
        env: "test",
        link: "https://test.xkool.org/koolplan/project/4195?entityId=4947",
      },
      {
        env: "prod",
        link: "",
      },
    ],
  },
  {
    category: "规划",
    videoUrl: "/mp_1_1.mp4",
    list: [
      {
        env: "dev",
        link: "https://dev.xkool.org/cad/p/257880349667753984/plan/257880603947433984?entityId=4947",
      },
      {
        env: "test",
        link: "https://test.xkool.org/cad/p/257880349667753984/plan/257880603947433984?entityId=4947",
      },
      {
        env: "prod",
        link: "https://www.xkool.ai/cad/p/286937710218706944/plan/286937756196667392?entityId=q375mv",
      },
    ],
  },
  {
    category: "时间管理",
    imgUrl: "/timeline-cover.png",
    link: "/timeline",
    list: [],
  },
];

function planeCurve(g: THREE.PlaneGeometry, z: number) {
  let p = g.parameters;
  let hw = p.width * 0.5;

  let a = new THREE.Vector2(-hw, 0);
  let b = new THREE.Vector2(0, z);
  let c = new THREE.Vector2(hw, 0);

  let ab = new THREE.Vector2().subVectors(a, b);
  let bc = new THREE.Vector2().subVectors(b, c);
  let ac = new THREE.Vector2().subVectors(a, c);

  let r =
    (ab.length() * bc.length() * ac.length()) / (2 * Math.abs(ab.cross(ac)));

  let center = new THREE.Vector2(0, z - r);
  let baseV = new THREE.Vector2().subVectors(a, center);
  let baseAngle = baseV.angle() - Math.PI * 0.5;
  let arc = baseAngle * 2;

  let uv = g.attributes.uv;
  let pos = g.attributes.position;
  let mainV = new THREE.Vector2();
  for (let i = 0; i < uv.count; i++) {
    let uvRatio = 1 - uv.getX(i);
    let y = pos.getY(i);
    mainV.copy(c).rotateAround(center, arc * uvRatio);
    pos.setXYZ(i, mainV.x, y, -mainV.y);
  }

  pos.needsUpdate = true;
}

export function HomeLayout(props: PropsWithChildren<{}>) {
  const waterContainerRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    preloadFont(
      {
        font: "/MaShanZheng-Regular.ttf",
      },
      () => {}
    );

    const raycaster = new THREE.Raycaster();
    let INTERSECTED: any;
    const pointer = new THREE.Vector2();
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { scene, camera } = useWater(
      waterContainerRef.current!,
      (scene, camera) => {
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObjects(scene.children, false);

        if (intersects.length > 0) {
          if (INTERSECTED != intersects[0].object) {
            if (INTERSECTED) {
              if (INTERSECTED instanceof Text) {
                const materital =
                  INTERSECTED.material as THREE.MeshBasicMaterial;
                materital.color.setHex(0xffffff);
              }
              // INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
            }

            INTERSECTED = intersects[0].object;

            if (INTERSECTED) {
              if (INTERSECTED instanceof Text) {
                const materital =
                  INTERSECTED.material as THREE.MeshBasicMaterial;
                materital.color.setHex(0x00ff00);
              }
            }
            // INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            // INTERSECTED.material.emissive.setHex(0xff0000);
          } else {
            // if (INTERSECTED)
            //   if (INTERSECTED instanceof Text) {
            //     // INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
            //     const materital = INTERSECTED.material as THREE.MeshBasicMaterial;
            //     materital.color.setHex(0xffffff);
            //     INTERSECTED = null;
            //   }
          }
        }
      }
    );

    for (let i = 0; i < List.length; i++) {
      const angle = -Math.PI * 0.5 + i * (Math.PI / 5);
      const currentBottomPosition = new THREE.Vector3(
        30 + 300 * Math.cos(angle),
        0,
        30 + 300 * Math.sin(angle)
      );

      const myText1 = new Text();
      scene.add(myText1);
      myText1.text = List[i].category;
      myText1.fontSize = 20;
      myText1.font = "/MaShanZheng-Regular.ttf";
      myText1.position.copy(currentBottomPosition);
      myText1.color = 0xffffff;
      myText1.position.y = 18;
      myText1.anchorX = "center";
      myText1.anchorY = "center";
      myText1.rotation.y = Math.PI / 2 - angle;
      myText1.scale.x = -1;
      myText1.userData.selfLink = List[i].link;
      myText1.sync();

      const geometry = new THREE.PlaneGeometry(120, 80, 1, 1);
      planeCurve(geometry, 4);

      if (List[i].imgUrl) {
        const vtexture = new THREE.TextureLoader().load(List[i].imgUrl!);
        const plane = new THREE.Mesh(
          geometry,
          new THREE.MeshBasicMaterial({
            side: THREE.BackSide,
            map: vtexture,
          })
        );
        scene.add(plane);
        plane.position.copy(currentBottomPosition);
        plane.position.y = 80;
        plane.rotation.y = Math.PI / 2 - angle;
      } else if (List[i].videoUrl) {
        const video = videoContainerRef.current[i];
        if (video) {
          video.play();
          const vtexture = new THREE.VideoTexture(video);
          const plane = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({
              side: THREE.BackSide,
              map: vtexture,
            })
          );
          scene.add(plane);
          plane.position.copy(currentBottomPosition);
          plane.position.y = 80;
          plane.rotation.y = Math.PI / 2 - angle;
        }
      }

      for (let j = 0; j < List[i].list.length; j++) {
        const myText = new Text();
        scene.add(myText);
        myText.text = List[i].list[j].env;
        myText.fontSize = 14;
        myText.position.copy(currentBottomPosition);
        myText.position.y = 150 + j * 20;

        myText.rotation.y = Math.PI / 2 - angle;
        myText.scale.x = -1;
        myText.anchorX = "center";
        myText.anchorY = "center";
        myText.color = 0xffffff;
        myText.userData.text = List[i].list[j].link;
        myText.sync();
      }

      // const mesh = getMesh();
      // mesh.position.copy(plane.position);
      // mesh.position.y = 100;
      // scene.add(mesh);
    }

    const loader = new GLTFLoader();
    loader.load("/building_06/scene.gltf", (data: any) => {
      console.log(data, "scene.gltf");
      const globj = data.scene as THREE.Group;
      globj.scale.set(40, 40, 40);
      globj.position.x -= 50;
      globj.position.z -= 50;
      const light = new THREE.PointLight(0xffffff, 2, 1000);
      light.position.copy(globj.position);
      globj.position.x -= 100;
      globj.position.z -= 100;
      light.position.y = 300;
      scene.add(light);
      scene.add(globj);
    });

    const myText1 = new Text();
    scene.add(myText1);
    myText1.text = "小库工具站";
    myText1.fontSize = 22;
    myText1.font = "/MaShanZheng-Regular.ttf";
    myText1.position.copy(new THREE.Vector3(-200, 150, -200));
    myText1.color = 0xffffff;
    myText1.anchorX = "center";
    myText1.anchorY = "center";
    myText1.rotation.y = Math.PI / 8;
    myText1.sync();

    drawCadViewFlow().then((meshes) => {
      const plane = new THREE.Object3D();
      const geometry = new THREE.PlaneGeometry(1000, 1000, 1, 1);
      // const plane = new THREE.Mesh(
      //   geometry,
      //   new THREE.MeshBasicMaterial({
      //     side: THREE.DoubleSide,
      //     color: 0x000000,
      //     opacity: 0.1,
      //   })
      // );
      if (meshes.length > 0) {
        plane.add(...meshes);
      }

      plane.position.copy(new THREE.Vector3(-400, 50, -200));
      scene.add(plane);
      plane.rotation.y = Math.PI / 4;
      plane.scale.copy(new THREE.Vector3(0.05, 0.05, 0.05));
      plane.position.y = 1000;
    });

    function onPointerMove(event: MouseEvent) {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    function onClick(event: MouseEvent) {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);
      const intersects = raycaster.intersectObjects(scene.children, false);

      if (intersects.length > 0) {
        const iobject = intersects[0].object;

        if (iobject && iobject instanceof Text) {
          const mesh = iobject as THREE.Mesh;
          if (mesh.userData.selfLink) {
            Router.push(mesh.userData.selfLink);
          } else if (mesh.userData.text) {
            window.open(mesh.userData.text);
          }
        }
      }
    }
    document.addEventListener("mousemove", onPointerMove);
    document.addEventListener("click", onClick);
  }, []);

  return (
    <div className={styles.home}>
      <div
        ref={waterContainerRef}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          zIndex: 10,
        }}
      />
      {List.map((item, itemi) => {
        if (!item.videoUrl) {
          return null;
        }
        return (
          <video
            key={item.category}
            ref={(ref) => {
              videoContainerRef.current[itemi] = ref;
            }}
            src={item.videoUrl}
            muted
            loop
            style={{ display: "none" }}
          />
        );
      })}
    </div>
  );
}
