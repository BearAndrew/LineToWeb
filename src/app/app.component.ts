import { NgxSpinnerService } from 'ngx-spinner';
import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';
import { PrimeNGConfig } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [MessageService, PrimeNGConfig]
})
export class AppComponent {
  title = 'test';
  date2: Date;
  de: any;
  term: string;
  term2: string;
  items: any[] = [{ name: "archie", sex: "male" }, { name: "jake", sex: "male" }, { name: "richard", sex: "male" }];
  array: string[] = ['archie', 'jake']



  fileContent: string;
  lines: string[];
  msgArray: any[] = [];
  members = [];

  constructor(private primengConfig: PrimeNGConfig, private spinner: NgxSpinnerService) {
    this.spinner.show();
  }

  ngOnInit(): void {
    this.de = {
      firstDayOfWeek: 1,
      dayNames: ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samastag"],
      dayNamesShort: ["Son", "Mon", "Die", "Mit", "Don", "Fre", "Sam"],
      dayNamesMin: ["阿","唷","Di","Mi","Do","Fr","Sa"],
      monthNames: [ "一月","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember" ],
      monthNamesShort: [ "一月", "Feb", "Mär", "Apr", "Mai", "Jun","Jul", "Aug", "Sep", "Okt", "Nov", "Dez" ],
      today: 'Heute',
      clear: 'Löschen',
      dateFormat: 'dd.mm.yy',
      weekHeader: 'Wo'
    };

    this.timer();
  }


  timer() {
    setTimeout(() => {
      console.log('timeout');
      this.timer();
    }, 10000);
  }


  upload(evnet) {

  }

  onChange(fileList: FileList): void {
    let file = fileList[0];
    let fileReader: FileReader = new FileReader();
    const self = this;
    fileReader.onloadend = () => {
      self.fileContent = fileReader.result as string;
      self.formatlizationIOS();
    }
    fileReader.readAsText(file);
  }

  // IOS txt 格式轉換
  formatlizationIOS() {
    // 依換行符號分割
    this.lines = this.fileContent.split("\n");

    let recordContent = false;
    const memberMsgNum = {};
    const memberMsgList = {};
    const dateList = [];
    let systemMsgNum = 0;

    // 逐行處理
    for(let i=3; i<this.lines.length; i++) {
      // 若格式為:一, MM/dd/yyyy; 記錄星期,日期
      if (/^[一二三四五六日],\s\d{2}\/\d{2}\/\d{4}\b/g.test(this.lines[i])) {
        recordContent = false;
        // string to Date
        const dateStr = this.lines[i].match(/\d{2}\/\d{2}\/\d{4}/)[0];
        const dateStrSplitArray = dateStr.split("/");
        const date = new Date(Number(dateStrSplitArray[2]), Number(dateStrSplitArray[0]) - 1, Number(dateStrSplitArray[1]));
        dateList.push(date);
        const msg = {content: this.lines[i], type: 'time'}
        this.msgArray.push(msg);
        systemMsgNum++;
        console.log(this.lines[i]);
      }

      // 若格式為:上午01:00  成員(發言者)  對話內容; 記錄對話訊息
      else if (/^(上|下)午\d{2}:\d{2}\b\t./g.test(this.lines[i])) {
        recordContent = false;
        const lineSplitArray = this.lines[i].split("\t");
        const msgTime = lineSplitArray[0]; // 對話時間
        const msgMember = lineSplitArray[1]; // 對話成員
        let msgContent = lineSplitArray[2]; // 對話內容

        // 若有對話內容
        if (msgContent) {
          // 若內容包含雙引號 " :代表內容有換行, 之後幾行加入此行的內容
          if (msgContent.includes('"')) {
            msgContent = msgContent.replace(/^\"/g, '');
            recordContent = true;
          }
        }

        //#region 儲存成員
        // 判斷是否為系統訊息: 名稱包含系統訊息且對話內容為undefined
        const isSystemMsg = (/(收回訊息|邀請|加入|退出|更改了群組圖片|通話|相簿|群組名稱|已讓|離開)/).test(msgMember) && !msgContent;
        if (!this.members.includes(msgMember) && !isSystemMsg) {
          this.members.push(msgMember);
          memberMsgNum[msgMember] = 0;
          memberMsgList[msgMember] = new Array(1).fill(0);
        }
        //#endregion
        memberMsgNum[msgMember]++;

        let msg = {};
        if (isSystemMsg) {
          systemMsgNum++;
          msg = {time: msgTime, content: msgMember, type: 'system'}
          console.log('時間:' + msgTime + ',\t內容:', msgMember);
        } else {
          msg = {time: msgTime, member: msgMember, content: msgContent, type: 'message'}
          console.log('時間:' + msgTime + ',\t成員:', msgMember + ',\t內容:' + msgContent);
        }
        this.msgArray.push(msg);
      }

      // 換行的對話內容
      else if (recordContent) {
        const line = this.lines[i].replace(/\"?/g, '');
        this.msgArray[this.msgArray.length-1].content += '\n' + line;
        console.log(line)
      }

    }

    console.log('DateList: ' + dateList);
    for (const member of this.members) {
      console.log('memberMsgNum[' + member + ']: ' + memberMsgNum[member]);
    }
    console.log('systemMsgNum: ' + systemMsgNum);
  }
}
