import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, AfterViewInit, ViewEncapsulation, ElementRef, Renderer2, Output, EventEmitter } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import * as yaml2Array from "js-yaml";
import $ from 'jquery';
import { DOCUMENT } from "@angular/common";
import { element } from 'protractor';
import { FirebaseService } from '../services/firebase.service';
declare var LeaderLine: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  encapsulation: ViewEncapsulation.None,

})
export class DashboardComponent implements AfterViewInit {

  @Output() isLogout = new EventEmitter<void>();

  LeaderLine: any;
  private filetoRead: any;
  private finalContent: any;
  parentMap: Map<string, string> = new Map();
  childrenMap: Map<string, string[]> = new Map();
  contentMap: Map<string, Object> = new Map();
  key: { id: number, name: string, show: boolean, childVisible: boolean, top: number, left: number, width: number }[] = [];
  nameIndexMap: Map<string, number> = new Map();
  calculateWidth: number[] = [55, 70, 85, 110, 120, 135]
  colorcode: string[] = ['#7134eb', '#0297d6', '#02d65e', '#f1f73b', '#cf6e29', '#cf2929', '#7134eb', '#0297d6', '#02d65e', '#f1f73b', '#cf6e29', '#cf2929'];
  val: any = {};
  data: any;
  dataIds: string[] = [];
  final_content = '';
  constructor(public firebaseService: FirebaseService) {
    this.val['root'] = false;
  }

  logout() {
    this.firebaseService.logout();
    this.isLogout.emit();
  }

  ngOnInit(): void {
    this.parentMap = new Map();
    this.childrenMap = new Map();
    this.contentMap = new Map();
    this.key = [];
    this.val = {};
    this.dataIds = [];
    this.nameIndexMap = new Map();
  }

  ngAfterViewInit(): void {

  }

  inIt(): void {
    this.parentMap = new Map();
    this.childrenMap = new Map();
    this.contentMap = new Map();
  }

  handleFileInput1(event: any): void {
    this.filetoRead = event.target.files[0];
  }
  async handleFileInput() {
    this.ngOnInit();
    // this.filetoRead = event.target.files[0];
    await this.fetchYaml(this.filetoRead);

    this.parentMap.set(this.getIdOfCurrentLevel(this.finalContent), 'root');
    this.childrenMap.set('root', [this.getIdOfCurrentLevel(this.finalContent)]);
    var t0 = new Date().getTime();

    await this.generateParentMap(this.finalContent, this.getIdOfCurrentLevel(this.finalContent));
    await this.generateChildrenMap(this.finalContent, this.getIdOfCurrentLevel(this.finalContent));
    await this.generateContentMap(this.finalContent);
    await this.generateHtmpContent();

    var t1 = new Date().getTime();
  }

  async fetchYaml(fileName: any) {
    return new Promise<void>((resolve, reject) => {
      let filereader = new FileReader();
      var self = this;
      filereader.onload = async function (event) {
        let fileContent = event.target.result;
        await self.addThisContentToFinalContent(fileContent);
        resolve();
      };
      filereader.readAsText(fileName);
    });
  }

  async addThisContentToFinalContent(content: any) {
    var obj = yaml2Array.load(content);
    this.finalContent = obj;
  }

  async generateHtmpContent() {
    return new Promise<void>((resolve, reject) => {
      let arr = Array.from(this.parentMap.keys());
      let counter = 0;
      arr.forEach((val) => {
        let size = val.split("_").length - 1;
        this.key.push({ 'id': counter, "name": val, "show": false, "childVisible": false, "top": 0, "left": 0, "width": this.calculateWidth[size] });
        this.nameIndexMap.set(val, counter);
        counter++;
      });

      this.key[0].show = true;
      this.key[0].left = 1900;

      document.getElementById('pati').scrollLeft = 1500;

      resolve();
    });
  }

  async generateChildrenMap(json: any, currentParent: string) {
    return new Promise<void>((resolve, reject) => {
      this.childrenMap.set(currentParent, []);
      if (json.hasOwnProperty('children')) {
        let array: string[] = this.childrenMap.get(currentParent);
        json.children.forEach((element: any) => {
          array.push(this.getIdOfCurrentLevel(element));
          this.generateChildrenMap(element, this.getIdOfCurrentLevel(element));
        });
        this.childrenMap.set(currentParent, array);
        resolve();
      }
      else {
        resolve();
      }
    });
  }

  async generateParentMap(json: any, currentParent: string) {
    return new Promise<void>((resolve, reject) => {
      if (json.hasOwnProperty('children')) {
        json.children.forEach((element: any) => {
          this.parentMap.set(this.getIdOfCurrentLevel(element), currentParent);
          this.generateParentMap(element, this.getIdOfCurrentLevel(element));
        });
        resolve();
      }
      else {
        resolve();
      }
    });
  }

  async generateContentMap(json: any, override?: any) {
    let array: string[] = Object.keys(json);

    return new Promise<void>((resolve, reject) => {
      var object: any = {};
      array.forEach((element: any) => {

        if (typeof json[element] == 'object' && element != "children" && element != "override") {
          if (element == 'data' && override != undefined) {
            this.makeObject2Data(override, object);
          }
          this.makeObject2Data(json[element], object);
        }
        else if (element == "override") {
          // object[element] = json[element];
          override = json[element];
        }
        else if (element != "children") {
          object[element] = json[element];
        }
      });
      this.contentMap.set(json.id, object);


      if (json.hasOwnProperty('children')) {
        json.children.forEach((element: any) => {
          this.generateContentMap(element, override);
        });
      }

      resolve();
    });

  }

  makeObject2Data(json: any, object: any): void {
    if (json == null) {
      return;
    }
    let dataarr: string[] = Object.keys(json);
    dataarr.forEach((element: any) => {
      if (typeof json[element] == 'object') {

        for (let i = 0; i < json[element].length; i++) {
          let dataarr2: string[] = Object.keys(json[element][i]);
          dataarr2.forEach((x: any) => {
            object[element + '_' + i + '_' + x] = json[element][i][x];
          });
        }
      }
      else {
        object[element] = json[element]
      }
    });
  }

  getIdOfCurrentLevel(json: any) {
    if (json.hasOwnProperty('id')) {
      return json.id;
    }
    else {
      return "";
    }
  }


  getIdOfNode(val: string): string {
    return this.parentMap.get(val);
  }



  makedecision(val: any) {
    this.data = this.contentMap.get(this.key[val].name);
    this.dataIds = Object.keys(this.data);
    if (!this.key[val].childVisible) {
      let arr: string[] = this.childrenMap.get(this.key[val].name);

      let nodeName = this.key[val].name;
      let nodeParent = this.parentMap.get(nodeName);
      let childArray = this.childrenMap.get(nodeParent);
      for (let i = 0; i < childArray.length; i++) {
        if (childArray[i] != nodeName) {
          this.makeRecursiveCallIfVisible(childArray[i]);
        }
        let x = this.nameIndexMap.get(childArray[i]);
        this.key[x].show = true;
        this.key[x].childVisible = false;
      }

      let node = document.getElementById('' + val);
      let nodeleft = parseInt(node.style.left.substring(0, node.style.left.length - 2));
      let nodetop = parseInt(node.style.top.substring(0, node.style.top.length - 2));
      let nodeheight = node.offsetHeight;
      let nodewidth = parseInt(node.style.width.substring(0, node.style.width.length - 2));;


      let bottompoint = nodetop + nodeheight + 60;

      let numberofchild = arr.length;
      let dummy: string[] = arr[0].split("_");
      let dummy2: string[] = nodeParent.split("_");
      let size = this.calculateWidth[dummy.length - 1];
      let centerpoint = nodeleft - (size - this.calculateWidth[dummy2.length - 1]) / 2;
      let startingpont: number = centerpoint;


      for (let i = 0; i < Math.floor(numberofchild / 2); i++) {
        let index: number = this.nameIndexMap.get(arr[i]);
        this.key[index].show = true;
        this.key[index].top = bottompoint;
        startingpont = startingpont - 20 - size;
        this.key[index].left = startingpont;
      }

      for (let i = Math.floor(numberofchild / 2); i < numberofchild; i++) {
        let index: number = this.nameIndexMap.get(arr[i]);
        this.key[index].show = true;
        this.key[index].top = bottompoint;
        this.key[index].left = centerpoint;
        centerpoint += size + 20;
      }

      for (let i = 0; i < numberofchild; i++) {
        var parentIntex: any = "" + val;
        var child: any = "" + this.nameIndexMap.get(arr[i]);

        let val1 = this.key[parentIntex].left + this.calculateWidth[dummy.length - 1] / 2;
        let val2 = bottompoint - 60;
        let val3 = this.key[child].left + size / 2;
        let val4 = this.key[child].top;

        document.getElementById("" + child + "_" + child).setAttribute('x1', "" + val1);
        document.getElementById("" + child + "_" + child).setAttribute('y1', "" + val2);
        document.getElementById("" + child + "_" + child).setAttribute('x2', "" + val3);
        document.getElementById("" + child + "_" + child).setAttribute('y2', "" + val4);
      }

      this.key[val].childVisible = true;
    }
    else {

      let arr: string[] = this.childrenMap.get(this.key[val].name);

      let nodeName = this.key[val].name;
      let nodeParent = this.parentMap.get(nodeName);
      let childArray = this.childrenMap.get(nodeParent);
      for (let i = 0; i < childArray.length; i++) {
        if (childArray[i] == nodeName) {
          this.makeRecursiveCallIfVisiblePart1(childArray[i]);
          let x = this.nameIndexMap.get(childArray[i]);
          this.key[x].show = true;
          this.key[x].childVisible = false;
        }

      }
      this.key[val].childVisible = false;
    }

  }

  styleObject(val: any) {
    let arr: string[] = this.key[val].name.split("_");
    let len = arr.length;
    if (val == 0) {
      let leftvalue: string = "" + this.key[val].left + "px";
      let topvalue: string = "" + this.key[val].top + "px";
      let widthvalue: string = "" + this.key[val].width + "px";
      return { visibility: this.key[val].show ? 'visible' : 'hidden', left: leftvalue, top: topvalue, width: widthvalue, background: this.colorcode[len - 1] };
    }
    else {
      let leftvalue: string = "" + this.key[val].left + "px";
      let topvalue: string = "" + this.key[val].top + "px";
      let widthvalue: string = "" + this.key[val].width + "px";
      return { visibility: this.key[val].show ? 'visible' : 'hidden', left: leftvalue, top: topvalue, width: widthvalue, background: this.colorcode[len - 1] };
    }
  }

  makeRecursiveCallIfVisible(val: string): void {
    let index = this.nameIndexMap.get(val);
    if (this.key[index].show || this.key[index].childVisible) {
      let hischild = this.childrenMap.get(this.key[index].name);
      for (let i = 0; i < hischild.length; i++) {
        this.makeRecursiveCallIfVisible(hischild[i]);
      }

      this.key[index].show = false;
      this.key[index].childVisible = false;
    }
  }

  makeRecursiveCallIfVisiblePart1(val: string): void {
    let index = this.nameIndexMap.get(val);
    let hischild = this.childrenMap.get(this.key[index].name);
    for (let i = 0; i < hischild.length; i++) {
      this.makeRecursiveCallIfVisiblePart1(hischild[i]);
      this.key[this.nameIndexMap.get(hischild[i])].show = false;
      this.key[this.nameIndexMap.get(hischild[i])].childVisible = false;
    }

  }


}
