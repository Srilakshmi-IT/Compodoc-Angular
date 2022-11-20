import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { NGXLogger } from "ngx-logger";
import { catchError, map, Observable, of, Subject, tap, throwError } from "rxjs";
import { LoggedInDetails, LoginInfo, User } from "../models/user";
import { UserService } from "./user.service";


const baseUrl='https://localhost:5000/api/users';

@Injectable()
export class HttpUserService implements UserService{

    loggedInUserAnnouncement = new Subject<LoggedInDetails|undefined>();
    loggedInUser?:LoggedInDetails;
    constructor(private http:HttpClient, private logger:NGXLogger){
        if(!this.loggedInUser)
        {
            var jsonString = localStorage.getItem("user");
            if(jsonString)
            {
                var user = JSON.parse(jsonString);
                this.updateCurrentUser(user);
            }
        }
    }
    getUserByEmail(email: string): Observable<User> {
        this.logger.trace('Entering into getUserByEmail method of user service');
        return this.http.get<User>(baseUrl+'/'+email);
    }
    
    getLoggedInUser(): LoggedInDetails|undefined {
        this.logger.trace('Entering into getLoggedInUser method of user service');
        return this.loggedInUser;
    }
    getAllUsers(): Observable<User[]> {
        this.logger.trace('Entering into getAllUsers method of user service');
        return this
                    .http
                    .get<User[]>(baseUrl);
    }
   
   

    getAuthenticationHeader()
    {
        if(!this.loggedInUser)
            return {};
        else
            return{
                Authorization:`BEARER ${this.loggedInUser.token}`
            }
    }

    updateCurrentUser(user?:LoggedInDetails){
        this.logger.trace('Entering into updateCurrentUser method of user service');
        this.loggedInUser=user;
        this.loggedInUserAnnouncement.next(user);
        if(this.loggedInUser)
            localStorage.setItem("user", JSON.stringify(this.loggedInUser));
        else    
            localStorage.removeItem("user");
    }

    login(loginInfo: LoginInfo): Observable<LoggedInDetails> {
        return this
                    .http
                    .post<LoggedInDetails>(`${baseUrl}/login`,loginInfo)
                    .pipe(
                        tap( (info:LoggedInDetails)=>{
                            console.log('user info received on login:',info);
                            this.logger.trace('Inside login method of user service');
                            this.updateCurrentUser(info);
                        })
                    );



    }
    
    register(user: User):  Observable<User> {
        this.logger.trace('Entering into register method of user service');
        return this.http.post<User>(baseUrl , user,{headers:{
            "content-type":"application/json"
        }});
    }

    _handleError(error:HttpErrorResponse){
        if(error.status === 404){
            return of(false);  //return false as an observable result
        } else{
            return throwError(()=> error); //else let the error go
        }
    }
    isEmailRegistered(email: string): Observable<boolean> {

        return this
                    .http
                    .get(`${baseUrl}/validate/${email}`)
                    .pipe(
                        map(response=>true), //incase of no error
                        catchError(this._handleError) //in case of error
                    );
       
    }
    getUserStatusAnnouncement(): Subject<LoggedInDetails | undefined> {
    this.logger.trace('Entering into getUserStatusAnnouncement method of user service');
    return this.loggedInUserAnnouncement;
    }

  
    logOut():Observable<void> {
        this.logger.trace('Entering into logOut method of user service');
        this.updateCurrentUser();
        return of(undefined);
    }
    
}