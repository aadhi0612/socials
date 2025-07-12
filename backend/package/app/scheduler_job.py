"""
Standalone scheduler job for executing scheduled posts
Can be run as a separate process or cron job
"""
import os
import sys
import logging
from datetime import datetime
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.interval import IntervalTrigger

# Add the parent directory to the path so we can import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.scheduler import post_scheduler
from app.database import create_tables

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('scheduler.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

def run_scheduler_job():
    """Run the post scheduler job"""
    logger.info("Starting scheduled post execution job")
    try:
        post_scheduler.run_scheduler_job()
        logger.info("Scheduled post execution job completed")
    except Exception as e:
        logger.error(f"Error in scheduled post execution job: {e}")

def main():
    """Main function to run the scheduler"""
    logger.info("Starting Social Media Post Scheduler")
    
    # Ensure database tables exist
    create_tables()
    
    # Create scheduler
    scheduler = BlockingScheduler()
    
    # Add job to run every 5 minutes
    scheduler.add_job(
        run_scheduler_job,
        trigger=IntervalTrigger(minutes=5),
        id='post_scheduler',
        name='Social Media Post Scheduler',
        replace_existing=True
    )
    
    # Add job to run immediately on startup
    scheduler.add_job(
        run_scheduler_job,
        trigger='date',
        run_date=datetime.now(),
        id='startup_job',
        name='Startup Post Check'
    )
    
    try:
        logger.info("Scheduler started. Press Ctrl+C to exit.")
        scheduler.start()
    except KeyboardInterrupt:
        logger.info("Scheduler stopped by user")
    except Exception as e:
        logger.error(f"Scheduler error: {e}")
    finally:
        scheduler.shutdown()

if __name__ == "__main__":
    main()
