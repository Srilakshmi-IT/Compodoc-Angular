import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { LoggerTestingModule } from "ngx-logger/testing";
import { dummybookings, dummybookingsmock } from "server-data/db-data";
import { HttpUserService } from "../../users/services/http-user-service";
import { BookingModule } from "../booking.module";
import { Booking } from "../models/booking";
import { BookingService } from "./booking.service";
import { HttpBookingService } from "./http-booking-service";

const Url='https://localhost:5000/api/bookings';
describe('BookingService',()=>{

    let httpTestingController: HttpTestingController;
    let service:BookingService;
    beforeEach(()=>{
        TestBed.configureTestingModule({
            imports:[BookingModule, HttpClientTestingModule,LoggerTestingModule],
            providers:[{provide:"BookingService",useClass:HttpBookingService},
        {provide:"UserService",useClass:HttpUserService}]
        });
        httpTestingController = TestBed.get(HttpTestingController);
        service=TestBed.get('BookingService');
    });
        it('return all bookings',()=>{
        service.getAllBookings()
        .subscribe((bookings)=>{
            expect(bookings).toBeTruthy();
            console.log("bookings.length",bookings.length)
            expect(bookings.length).toBe(dummybookings.length);
          
           
        });
        const req=httpTestingController.expectOne(Url);
        expect(req.request.method).toEqual("GET");
        req.flush(dummybookings)
     
            });
            
        it('should find by id',()=>{
                service.getBookingById(dummybookings[0].id)
                .subscribe(booking=>{
                    expect(booking).toBeTruthy();
                    expect(booking.id).toBe(dummybookings[0].id);
        });
        const req=httpTestingController.expectOne(`${Url}/1`);
        expect(req.request.method).toEqual("GET");
        req.flush(dummybookings[0]);
        });

        it('should update details by id',()=>{
        service.updateBooking(dummybookings[0],dummybookings[0].id)
        .subscribe(bookings=>{
            expect(bookings).toBeTruthy();
            console.log(dummybookings.numberOfDaysStay);
            expect(bookings.numberOfDaysStay).toEqual(dummybookingsmock[0].numberOfDaysStay);
        });
        const req=httpTestingController.expectOne(`${Url}/${dummybookingsmock[0].id}`);
        expect(req.request.method).toEqual("PUT");    
        req.flush(dummybookingsmock[0]);
        });
        
        it('should delete a booking by id', () => {
            service.cancelBooking(dummybookings.id)
                   .subscribe(result =>{
                        expect(result).toBeNull();
                });              
            const req = httpTestingController.expectOne(`${Url}/${dummybookings.id}`);        
            expect(req.request.method).toEqual("DELETE");
            req.flush(null);       
        });  
       
    
    it('should add booking',()=>{
        const changes:Partial<Booking>={numberOfDaysStay:7};
        service.addBooking(dummybookings).subscribe(dummybookings=>{
            expect(dummybookings.id).toBe(1);
        });
        const req=httpTestingController.expectOne(`${Url}`);
        expect(req.request.method).toEqual("POST");
    });

    afterEach(() => {
        httpTestingController.verify();
    
    });
    
    
});

