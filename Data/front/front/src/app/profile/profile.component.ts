import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { ProfileService } from './profile.service';
import { Observable, firstValueFrom, tap } from 'rxjs';
import { AuthService } from '../login/auth.service';
import { ActivatedRoute } from '@angular/router';
import { StatusService } from '../status.service';
import { FriendshipService } from './friendship.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  
  public profile$ !: Observable<any>;
  profile = "/assets/img/profile.jpg";
  logo = "LOGO is loading";
  // private correntUser : any;
  public profileSubject$ !: Observable<any>;
  public auth$ !: Observable<any>;
  public username : any;
  public status !: string;
  displayRespondingWay : boolean = false;
  type : number = 0;
  YourBodyChoosen = false;

  friendRequest$!: Observable<any>;
  friendList$!: Observable<any>;
  blockedList$!: Observable<any>;
  friendRequestSkip : number = 0;
  friendListSkip : number = 0;
  blockListSkip : number = 0;

  // to unsubscribe subscribed Observables
  replay !: any;
  replay_ !: any;

  constructor(public profileService : ProfileService, private authService: AuthService,
              private route: ActivatedRoute, private state : StatusService,
              private friendship : FriendshipService) {
    this.username = this.route.snapshot.params["username"];
  }
  ngOnInit(): void {
    if (!this.username || this.username == '')
    {
      this.YourBodyChoosen = true;
      this.profileSubject$ = this.profileService.getMyData();
      this.replay_ = this.profileSubject$.subscribe({next: (data : Observable<any>) => {
      this.profile$ = data;}});
      this.friendRequest$ = this.friendship.requestsList(this.friendRequestSkip, 10)
      this.blockedList$ = this.friendship.blocklist(this.blockListSkip, 10)
      this.friendList$ = this.friendship.friendList(this.friendListSkip, 10)
      this.friendship.friendRealTimeStatus().subscribe((data : any) => {
        if (data)
        {
          console.log(data);
          this.friendList$ = this.friendship.friendList(this.friendListSkip, 10);
          this.friendRequest$ = this.friendship.requestsList(this.friendRequestSkip, 10);
          this.blockedList$ = this.friendship.blocklist(this.blockListSkip, 10);
        }});

    }
    else
    {
      this.profile$ = this.profileService.getUserData(this.username);
      this.friendship.friendRealTimeStatus().subscribe((state) => {
        if (state?.senderId && state.senderId == this.username)
          this.type = state.type;
      })
      this.friendship.friendStatus(this.username).subscribe((data : any) => {
        if (data)
        {
          if (!data.status)
            this.type = 0; // not friends
          else if (data.status == 'you blocked')
            this.type = 1; // unblock
          else if (data.status == 'you are blocked')
            this.type = 2; // nothing to show
          else if (data.status == 'you are accepted')
            this.type = 3; // friends
          else if (data.status == 'accept?')
            this.type = 4; // accept or cancel
          else if (data.status == 'you are on pending')
            this.type = 5; // cancel request
        }
        else
          this.type = 0;
      });
    }
    this.auth$ = this.authService.getCurrentUser();
  }
  ngOnDestroy(): void {
    if (this.replay)
      this.replay.unsubscribe();
    if (this.replay_)
      this.replay_.unsubscribe();
  }
  sameDataEveryDay = [
    {path: "/assets/RankIcon.svg", name: "Rank",score: "20"},
    {path: "/assets/RankIcon.svg", name: "Rank",score: "01"},
    {path: "/assets/RankIcon.svg", name: "Rank",score: "01"},
    {path: "/assets/RankIcon.svg", name: "Rank",score: "01"}]

  historyRaw = [
    {pathU: "/assets/profilePic.svg", pathOp: "/assets/theplayer.svg", name: "Kid-bouh VS Sakllam", state: "Win 🏆", date: "Date" }, 
    {pathU: "/assets/profilePic.svg", pathOp: "/assets/theplayer.svg", name: "Kid-bouh VS Sakllam", state: "Win 🏆", date: "Date" }, 
    {pathU: "/assets/profilePic.svg", pathOp: "/assets/theplayer.svg", name: "Kid-bouh VS Sakllam", state: "Win 🏆", date: "Date" }, 
  ]

  statusLoading(id: any)
  {
      this.replay = this.state.current_status.subscribe((curr) => {
        const newone = curr.find((obj: any) => {if (obj.id == id) return obj;});
        if (newone)
          this.status = newone.status;
        else
          this.status = 'Offline'
      });
  }
  hideIt = () => {this.displayRespondingWay = !this.displayRespondingWay}
  // logic of friendships

  // async RealUsername ()
  // {
  //   console.log('Hello')
  //   try
  //   {
  //     this.correntUser = await firstValueFrom(this.profile$)
  //     console.log(this.correntUser)
  //   }
  //   catch (err)
  //   {
  //     this.correntUser = {error: 'hey'}
  //   }
  // }
  async addFriend()
  {
    // await this.RealUsername ();
    this.friendship.addFriend(Number.parseInt( this.username));
  }
  
  async cancelFriend()
  {
    // await this.RealUsername ();
    this.displayRespondingWay = false;
    this.friendship.cancelFriendRequest(Number.parseInt( this.username));
  }
  async respondAcceptFriend()
  {
    // await this.RealUsername ();
    this.displayRespondingWay = false;
    this.friendship.acceptRequest(Number.parseInt( this.username));
  }
  async unFriend()
  {
    // await this.RealUsername ();
    this.friendship.unfriendUser(Number.parseInt( this.username));
  }
  async blockUser()
  {
    // await this.RealUsername ();
    this.friendship.blockUser(Number.parseInt( this.username));
  }
  async unBlock()
  {
    // await this.RealUsername ();
    this.friendship.unblockUser(Number.parseInt( this.username));
  }
  changeMode()
  {
    this.YourBodyChoosen = !this.YourBodyChoosen;
  }
  isObject(value: any): boolean {
    return Array.isArray(value)
  }

  updating (type: number)
  {
    if (type == 1)
    this.friendList$ = this.friendship.friendList(this.friendListSkip, 10);
  else if (type == 2)
    this.friendRequest$ = this.friendship.requestsList(this.friendRequestSkip, 10);
  else
    this.blockedList$ = this.friendship.blocklist(this.blockListSkip, 10);
  }
  up(skip: number, type : number)
  {
    skip += 10;
    this.updating(type);
  }
  
  down(skip: number, type : number)
  {
    if (skip)
    {
      skip -= 10;
      this.updating(type);
    }
  }
}
