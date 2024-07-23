import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { AppState } from 'src/app/store/node.state';
import * as NodeActions from '../../store/node.actions';
import { NodeType, Node } from 'src/app/models/node.model';
import { Store, select } from '@ngrx/store';
import * as NodeSelectors from '../../store/node.selectors';
import { EnvVariable } from '@/app/models/env.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.sass']
})
export class SideBarComponent {
  @Input() nodes: Node[] | null = [];
  activeTab: string = 'canvas';
  newEnvKey: string = '';
  newEnvValue: string = '';
  envVariables$: Observable<EnvVariable[]>;
  NodeType = NodeType
  isEditing: boolean = false
  newVal: string = '';
  editingKey: string | null = null;
  @Output() centerNodeEvent = new EventEmitter<{ x: number, y: number }>();
  @ViewChild('editInput') editInput: ElementRef | undefined;

  constructor(private store: Store<{ appState: AppState }>) {
    this.envVariables$ = this.store.pipe(select(NodeSelectors.selectEnv));
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  addEnvVariable(nextInput: HTMLElement) {
    nextInput.blur();
    const envVariable: EnvVariable = { key: this.newEnvKey, value: this.newEnvValue };
    this.store.dispatch(NodeActions.addEnvVariable({ envVariable }));
    this.newEnvKey = '';
    this.newEnvValue = '';
  }

  capitalize() {
    this.newEnvKey = this.newEnvKey.toUpperCase();
  }

  edit(env: EnvVariable) {
    this.isEditing = true;
    this.newVal = env.value;
    this.editingKey = env.key;
    setTimeout(() => this.editInput!.nativeElement.focus(), 0);
  }

  save(key: string) {
    if (this.newVal == "") {
      this.store.dispatch(NodeActions.deleteEnvVariable({ key }));
    } else {
      this.store.dispatch(NodeActions.updateEnvVariable({ key: key, value: this.newVal }));
      this.newVal = '';
    }
    this.isEditing = false;
  }

  moveToNextInput(nextInput: HTMLInputElement) {
    nextInput.focus();
  }

  addNode(nodeType: NodeType): void {
    const newNode: Node = {
      id: this.generateUniqueId(),
      name: `${nodeType} Node`,
      position: { x: 1000, y: 200 },
      width: 250,
      type: nodeType,
      content: "const middleware = (req, res, next) => {\n  console.log(\'Request received\');\n  next();\n};"
    };
    this.store.dispatch(NodeActions.addNode({ node: newNode }));
  }

  generateUniqueId(): string {
    const now = new Date();
    const uniqueId = `${now.getFullYear()}${this.pad(now.getMonth() + 1, 2)}${this.pad(now.getDate(), 2)}${this.pad(now.getHours(), 2)}${this.pad(now.getMinutes(), 2)}${this.pad(now.getSeconds(), 2)}${this.pad(now.getMilliseconds(), 3)}`;
    return uniqueId;
  }

  pad(num: number, size: number): string {
    let s = num.toString();
    while (s.length < size) s = "0" + s;
    return s;
  }


  centerNode(node: Node) {
    this.centerNodeEvent.emit(node.position);
  }
}